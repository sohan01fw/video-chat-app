import ReactPlayer from "react-player";
export function VideoStream({ myStream }) {
  return (
    <div>
      <ReactPlayer
        height={"300px"}
        width="400px"
        playing
        muted
        url={myStream}
      />
    </div>
  );
}
