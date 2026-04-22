const clientIo = io("http://localhost:3000",{
  auth:{
    authorization:"bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTAzNGEyZjE4YzA0M2U2MTdiY2IwZSIsImVtYWlsIjoic2FsZW1iYWxib3VsOTZAZ21haWwuY29tIiwiaWF0IjoxNzczMjMyMzM0LCJleHAiOjE4MDQ3ODk5MzQsImp0aSI6IjIzM2UzZTkxLTU3YjgtNGVmYy04OTg3LWNkYTYwMzlmMzVkYiJ9.W61zUdzirOS_jw6iomZE7fyr-_d60KkjBja5cVyvtRM"
  }
})


clientIo.on("connect", () => {
  console.log("connected to server")
})
clientIo.on("message", (data) => {
    console.log(data)
  })

clientIo.on("userDisconnected", (data) => {
    console.log(data)
  })

clientIo.on("connect_error", (err) => {
  console.log(err.message)
})
