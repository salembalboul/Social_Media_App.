import { NextFunction, Request, Response } from "express";
import PostModel, {
  AvailablityEnum,
  IPost,
} from "../../DB/model/post.model.js";
import { PostRebository } from "../../DB/rebositories/post.repo.js";
import { UserRebository } from "../../DB/rebositories/user.rebos.js";
import UserModel from "../../DB/model/user.model.js";
import { appError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { v4 as uuidv4 } from "uuid";
import {
  getPostValidationType,
  LikeActionEnum,
  likePostQueryType,
  likePostValidationType,
} from "./post.validation.js";
import { UpdateQuery } from "mongoose";

export const AvailablityPost = (req: Request) => {
  return [
    { availablity: AvailablityEnum.public },
    { availablity: AvailablityEnum.private, createdBy: req?.user?._id as any },
    {
      availablity: AvailablityEnum.friends,
      createdBy: {
        $in: [...(req?.user?.friends || []), req?.user?._id as any],
      },
    },
  ];
};

export class PostService {
  private _postModel = new PostRebository(PostModel);
  private _userModel = new UserRebository(UserModel);

  constructor() {}

  //======================createPost======================
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    //  const {content,attachment,assetFolder,allowComment,availablity,tags}:createPostValidationType=req.body

    if (
      req?.body?.tags?.length &&
      (
        (await this._userModel.find({
          filter: { _id: { $in: req?.body?.tags } },
        })) as []
      ).length !== req?.body?.tags?.length //dublicate ids
    ) {
      throw new appError("invalid user id", 400);
    }
    const assetFolder = uuidv4();

    let arrUrls: string[] = [];

    if (req?.files) {
      const files = req?.files as Express.Multer.File[];

      for (const file of files) {
        const { secure_url } = await cloudinary.uploader.upload(file.path, {
          folder: `social-media/users/${req?.user?._id}/posts/${assetFolder}`,
        });
        arrUrls.push(secure_url);
      }
    }
    // console.log("Files received:", req.files);
    // console.log(arrUrls);

    const post = await this._postModel.create({
      ...req.body,
      attachment: arrUrls,
      assetFolder,
      createdBy: req?.user?._id,
    });

    if (!post) {
      await cloudinary.api.delete_resources(arrUrls);
      throw new appError("failed to create post", 500);
    }

    return res.status(201).json({ message: "created success", post });
  };

  //======================likePost======================
  likePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId }: likePostValidationType =
      req.params as likePostValidationType;

    const { action }: likePostQueryType = req.query as likePostQueryType;

    let updateQuery: UpdateQuery<IPost> = {
      $addToSet: { likes: req?.user?._id },
    };

    if (action === LikeActionEnum.unlike) {
      updateQuery = { $pull: { likes: req?.user?._id } };
    }

    const post = await this._postModel.findOneAndUpdate(
      { _id: postId, $or: AvailablityPost(req) },
      updateQuery,
      { new: true },
    );
    if (!post) {
      throw new appError("post not found", 404);
    }

    return res.status(200).json({ message: `${action}`, post });
  };
  //======================updatePost======================
  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId }: likePostValidationType =
      req.params as likePostValidationType;

    const post = await this._postModel.findOne({
      _id: postId,
      createdBy: req?.user?._id as any,
      //paranoid:false
    });

    if (!post) {
      throw new appError("post not found or deleted", 404);
    }
    if (req?.body?.content) {
      post.content = req?.body?.content;
    }
    if (req?.body?.availablity) {
      post.availablity = req?.body?.availablity;
    }
    if (req?.body?.allowComment) {
      post.allowComment = req?.body?.allowComment;
    }

    if (req?.body?.tags) {
      if (
        req?.body?.tags?.length &&
        (
          (await this._userModel.find({
            filter: { _id: { $in: req?.body?.tags } },
          })) as []
        ).length !== req?.body?.tags?.length //dublicate ids
      ) {
        throw new appError("invalid user id", 400);
      }
      post.tags = req?.body?.tags;
    }
    const files = req?.files! as Express.Multer.File[];

    if (files?.length) {
      await cloudinary.api.delete_resources(post.attachment as string[]);

      post.attachment = [];

      for (const file of files) {
        const { secure_url } = await cloudinary.uploader.upload(file.path, {
          folder: `social-media/users/${req.user?._id}/posts/${post.assetFolder}`,
        });

        post.attachment.push(secure_url);
      }

      await post.save();
    }

    return res.status(200).json({ message: "updated success", post });
  };

  //======================getPost======================
  getPost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId }: getPostValidationType =
      req.params as getPostValidationType;

    const post = await this._postModel.findById(postId);

    if (!post) {
      throw new appError("post not found", 404);
    }

    return res.status(200).json({ message: "get success", post });
  };

  //======================getAllPosts======================
  getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    let { page = 1, limit = 5 } = req.query as unknown as {
      page: number;
      limit: number;
    };

    if (page < 0) page = 1;
    page = page * 1 || 1;
    const skip = (page - 1) * limit;

    const { docs, currentpage, countDocuments, numberOfPages } =
      await this._postModel.paginate({
        filter: {},
        query: { page, limit },
        options: {
          populate: [
            {
              path: "comments",
              match: { commentId: { $exists: false } },
              select: "content attachment",
              populate: {
                path: "replies",
                match: { commentId: { $exists: true } },
              },
            },
          ],
        },
      });

    return res.status(200).json({
      message: "get all success",
      currentpage,
      countDocuments,
      numberOfPages,
      posts: docs,
    });
  };
}

export default new PostService();
