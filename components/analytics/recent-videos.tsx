import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentVideos = [
  { title: "How to Build a React App", views: 1200, date: "2023-06-15" },
  { title: "TypeScript Tips and Tricks", views: 980, date: "2023-06-10" },
  { title: "Next.js 13 Tutorial", views: 1500, date: "2023-06-05" },
];

export function RecentVideos() {
  return (
    <div className="space-y-8">
      {recentVideos.map((video) => (
        <div key={video.title} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-image.jpg" alt="Video thumbnail" />
            <AvatarFallback>VT</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{video.title}</p>
            <p className="text-sm text-muted-foreground">
              {video.views} views • {video.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
