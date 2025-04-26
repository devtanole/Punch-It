import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  type Post,
  type NewPost,
  addPost,
  readPost,
  removePost,
  updatePost,
} from '../lib/data';
import { MediaUploads } from '../components/MediaUploads';

const MAX_MEDIA = 4;

export function PostForm() {
  const { postId } = useParams();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [textContent, setTextContent] = useState('');
  const [post, setPost] = useState<Post>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const isEditing = postId && postId !== 'new';

  useEffect(() => {
    async function load(id: number) {
      setIsLoading(true);
      try {
        const post = await readPost(id);
        if (!post) throw new Error(`Post with ID ${id} not found`);
        setPost(post);
        setMediaUrls(post?.mediaUrls);
        setTextContent(post.textContent);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (isEditing) load(+postId);
  }, [postId, isEditing]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawText = formData.get('textContent');
    const textContent =
      (typeof rawText === 'string' ? rawText.trim() : '') ?? '';

    if (!textContent && mediaUrls.length === 0) {
      alert('Post must have either text or media');
      return;
    }

    const newPost: NewPost = { textContent: textContent.trim(), mediaUrls };

    try {
      if (isEditing && post) {
        await updatePost({ ...post, ...newPost });
      } else {
        const createdPost = await addPost(newPost);
        alert(
          `Successfully posted ${createdPost.postId} from userId ${createdPost.userId}.`
        );
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      alert(`Error saving post: ${String(err)}`);
    }
  }

  async function handleDelete() {
    if (!post?.postId) throw new Error('Should never happen');
    try {
      setIsDeleting(true);
      await removePost(post.postId);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(`Error deleting post:` + String(err));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <div>Loading...</div>; //replace later with mui component
  if (error) {
    return (
      <div>
        Error Loading Post with ID {postId}:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="column-full d-flex justify-between">
          <h1>New Post</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row margin-bottom-1">
          <div className="column-full">
            <label className="margin-bottom-1 d-block">Text Content</label>
            <textarea
              name="textContent"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="input-b-color text-padding input-b-radius purple-outline d-block width-100"
              cols={25}
              rows={10}
            />
          </div>
        </div>
        <div className="row margin-bottom-1">
          <div className="column-full">
            {mediaUrls.length < MAX_MEDIA && (
              <MediaUploads
                onUpload={(url) => {
                  setMediaUrls((prev) => [...prev, url]);
                }}
                disabled={mediaUrls.length >= MAX_MEDIA}
              />
            )}
            {mediaUrls.length >= MAX_MEDIA && (
              <p>You can only upload a maximum of 4 media files</p>
            )}
          </div>
        </div>
        {mediaUrls.length > 0 && (
          <div className="row margin-bottom-1">
            <div className="column-full">
              {mediaUrls.map((url, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  {url.includes('.mp4') || url.includes('.webm') ? (
                    <video width="250" controls src={url} />
                  ) : (
                    <img src={url} alt={`media-${index}`} width="250" />
                  )}
                  <br />
                  <button
                    type="button"
                    onClick={() =>
                      setMediaUrls((prev) => prev.filter((_, i) => i !== index))
                    }>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="row">
          <div className="column-full d-flex justify-between">
            {isEditing && (
              <button
                className="delete-entry-button"
                type="button"
                onClick={() => setIsDeleting(true)}>
                Delete Post
              </button>
            )}
            <button type="submit">POST</button>
          </div>
        </div>
      </form>
      {isDeleting && (
        <div
          id="modalContainer"
          className="modal-container d-flex justify-center align-center">
          <div className="modal row">
            <div className="column-full d-flex justify-center">
              <p>Are you sure you want to delete this post?</p>
            </div>
            <div className="column-full d-flex justify-between">
              <button
                className="modal-button"
                onClick={() => setIsDeleting(false)}>
                Cancel
              </button>
              <button
                className="modal-button red-background white-text"
                onClick={handleDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
