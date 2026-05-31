const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const commentList = document.querySelector(".watch__comment-list");
const commentCount = document.querySelector(".watch__comment-count");

const formatDate = (date) => new Date(date).toLocaleDateString("ko-KR");

const getAvatarSrc = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http") || avatarUrl.startsWith("/")) {
    return avatarUrl;
  }
  return `/${avatarUrl}`;
};

const updateCommentCount = () => {
  const count = commentList.querySelectorAll(".watch__comment").length;
  commentCount.innerText = `${count} comments`;
};

const showEmptyMessage = () => {
  if (commentList.querySelector(".watch__comment")) {
    return;
  }

  const emptyMessage = document.createElement("li");
  emptyMessage.className = "watch__empty-comments";
  emptyMessage.textContent = "No comments yet. Be the first to start the conversation.";
  commentList.appendChild(emptyMessage);
};

const createDeleteButton = () => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "watch__comment-delete";
  button.setAttribute("aria-label", "Delete comment");
  button.textContent = "Delete";
  return button;
};

const createLikeButton = ({ liked = false, likesCount = 0 } = {}) => {
  const button = document.createElement("button");
  const icon = document.createElement("i");
  const count = document.createElement("span");

  button.type = "button";
  button.className = "watch__comment-like";
  button.dataset.liked = liked ? "true" : "false";
  button.setAttribute("aria-label", liked ? "Unlike comment" : "Like comment");
  if (liked) {
    button.classList.add("is-liked");
  }

  icon.className = `watch__comment-like-icon ${liked ? "fas" : "far"} fa-heart`;
  icon.setAttribute("aria-hidden", "true");
  count.className = "watch__comment-like-count";
  count.textContent = likesCount;

  button.append(icon, count);
  return button;
};

const updateLikeButton = (button, { liked, likesCount }) => {
  const icon = button.querySelector(".watch__comment-like-icon");
  const count = button.querySelector(".watch__comment-like-count");

  button.dataset.liked = liked ? "true" : "false";
  button.classList.toggle("is-liked", liked);
  button.setAttribute("aria-label", liked ? "Unlike comment" : "Like comment");
  icon.className = `watch__comment-like-icon ${liked ? "fas" : "far"} fa-heart`;
  count.textContent = likesCount;
};

const addComment = ({ _id, text, createdAt, owner, liked, likesCount }) => {
  const emptyMessage = commentList.querySelector(".watch__empty-comments");
  if (emptyMessage) {
    emptyMessage.remove();
  }

  const ownerName = owner?.name || "Anonymous";
  const avatarSrc = getAvatarSrc(owner?.avatarUrl);
  const newComment = document.createElement("li");
  const avatar = document.createElement(avatarSrc ? "img" : "div");
  const body = document.createElement("div");
  const meta = document.createElement("div");
  const actions = document.createElement("div");
  const footer = document.createElement("div");
  const name = document.createElement("strong");
  const date = document.createElement("span");
  const content = document.createElement("p");

  newComment.className = "watch__comment";
  newComment.dataset.id = _id;
  avatar.className = "watch__comment-avatar";
  body.className = "watch__comment-body";
  meta.className = "watch__comment-meta";
  actions.className = "watch__comment-actions";
  footer.className = "watch__comment-footer";

  if (avatarSrc) {
    avatar.src = avatarSrc;
    avatar.alt = ownerName;
  } else {
    avatar.textContent = ownerName.charAt(0).toUpperCase();
  }
  name.textContent = ownerName;
  date.textContent = formatDate(createdAt);
  content.textContent = text;

  actions.appendChild(date);
  footer.append(createLikeButton({ liked, likesCount }), createDeleteButton());
  meta.append(name, actions);
  body.append(meta, content, footer);
  newComment.append(avatar, body);

  commentList.prepend(newComment);
  updateCommentCount();
};

const handleClick = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value.trim();
  const videoId = videoContainer.dataset.videoId;
  if (text === "") {
    return;
  }

  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    const { newComment } = await response.json();
    addComment(newComment);
    textarea.value = "";
  }
};

if (form) {
  form.addEventListener("submit", handleClick);
}

commentList.addEventListener("click", async (event) => {
  const likeButton = event.target.closest(".watch__comment-like");
  if (likeButton) {
    const comment = likeButton.closest(".watch__comment");
    const commentId = comment?.dataset.id;
    if (!commentId) {
      return;
    }

    const liked = likeButton.dataset.liked === "true";
    likeButton.disabled = true;

    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: liked ? "DELETE" : "POST",
    });

    if (response.status === 200) {
      const data = await response.json();
      updateLikeButton(likeButton, data);
    }

    likeButton.disabled = false;
    return;
  }

  const deleteButton = event.target.closest(".watch__comment-delete");
  if (!deleteButton) {
    return;
  }

  const comment = deleteButton.closest(".watch__comment");
  const commentId = comment?.dataset.id;
  if (!commentId) {
    return;
  }

  deleteButton.disabled = true;

  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });

  if (response.status === 200) {
    comment.remove();
    updateCommentCount();
    showEmptyMessage();
    return;
  }

  deleteButton.disabled = false;
});