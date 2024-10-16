import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const topVideos = [
  { title: "React Hooks Explained", views: 50000, likes: 2500, comments: 300 },
  {
    title: "Building a REST API with Node.js",
    views: 45000,
    likes: 2200,
    comments: 280,
  },
  {
    title: "CSS Grid Layout Tutorial",
    views: 40000,
    likes: 2000,
    comments: 250,
  },
  {
    title: "JavaScript ES6 Features",
    views: 38000,
    likes: 1900,
    comments: 220,
  },
  { title: "Vue.js for Beginners", views: 35000, likes: 1750, comments: 200 },
];

export function TopVideos() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead className="text-right">Likes</TableHead>
          <TableHead className="text-right">Comments</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topVideos.map((video) => (
          <TableRow key={video.title}>
            <TableCell className="font-medium">{video.title}</TableCell>
            <TableCell className="text-right">
              {video.views.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">
              {video.likes.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">
              {video.comments.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
