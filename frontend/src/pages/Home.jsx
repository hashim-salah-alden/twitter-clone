import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Posts from "../components/common/Posts";
import CreatePost from "../components/CreatePost";

const Home = () => {
  const [feedType, setFeedType] = useState("forYou");

  // Clear all cached data
  const queryClient = useQueryClient();
  useEffect(() => {
    return () => {
      // Clear all cached data
      queryClient.resetQueries({ queryKey: ["posts"] });
    };
  }, [queryClient]);

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        {/* Header */}
        <div className="flex w-full border-b border-gray-700">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("forYou")}
          >
            For you
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        {/*  CREATE POST INPUT */}
        <CreatePost />

        {/* POSTS */}
        <Posts feedType={feedType} username="hashim97" />
      </div>
    </>
  );
};
export default Home;
