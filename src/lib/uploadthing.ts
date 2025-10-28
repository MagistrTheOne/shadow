import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createTRPCContext } from "@/trpc/init";
import { auth } from "@/lib/auth";

const f = createUploadthing();

// File router for avatars and banners
export const ourFileRouter = {
  // Avatar uploader
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Verify user is authenticated
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return the file URL for storing in database
      return { url: file.url };
    }),

  // Banner uploader
  bannerUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Verify user is authenticated
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return the file URL for storing in database
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
