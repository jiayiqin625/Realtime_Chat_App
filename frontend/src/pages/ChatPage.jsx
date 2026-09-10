import React from "react";
import toast from "react-hot-toast";

const ChatPage = () => {
  return (
    <div>
      <button
        onClick={() => {
          toast.success("success");
        }}
      >
        Click
      </button>
    </div>
  );
};

export default ChatPage;
