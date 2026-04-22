import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve("./config/.env") });
import express from "express";
export const app = express();
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { appError } from "./utils/classError.js";
import userRouter from "./modules/users/user.controller.js";
import connectionDB from "./DB/connectionDB.js";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import postRouter from "./modules/post/post.controller.js";
const writePipeLine = promisify(pipeline);
import { intialiazationIo } from "./modules/gateway/gateway.js";
import chatRouter from "./modules/chat/chat.controller.js";
import { createHandler } from "graphql-http/lib/use/express";
import { schemaGQL } from "./modules/graphql/schema.gql.js";
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many requests from this IP, please try again after 15 minutes",
    statusCode: 429,
    legacyHeaders: false,
    skipFailedRequests: true,
    skipSuccessfulRequests: true,
});
const port = process.env.PORT || 5000;
const bootstrap = async () => {
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(limiter);
    await connectionDB();
    app.all("/graphql", createHandler({ schema: schemaGQL, context: (req) => ({ req }) }));
    app.get("/", (req, res, next) => {
        return res.status(200).send({
            mesage: "welcome to the social media welcome on my social media app...........❤️",
        });
    });
    app.use("/uploads", express.static("uploads"));
    app.use("/users", userRouter);
    app.use("/posts", postRouter);
    app.use("/chat", chatRouter);
    app.use("{/*demo}", (req, res, next) => {
        throw new appError(`invalid url  ${req.originalUrl}`, 404);
    });
    app.use((error, req, res, next) => {
        return res
            .status(error.statusCode || 500)
            .json({ message: error.message, stack: error.stack });
    });
    const httpServer = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    intialiazationIo(httpServer);
};
export default bootstrap;
//# sourceMappingURL=app.controller.js.map