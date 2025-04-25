import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';
import { Post, readPosts } from '../lib/data';
import { User, useUser } from '../components/useUser';
import { Comments } from './Comments';

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();

  useEffect(() => {
    async function load() {
      try {
        const posts = await readPosts();
        setPosts(posts);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (user) load();
  }, []);
  if (!user) return <div>Login to continue</div>;
  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <div>
        Error Loading Posts:{' '}
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="column-full d-flex justify-between align-center">
          <h1>Posts</h1>
          <h3>
            <Link to="/details/new" className="white-text form-link">
              Post
            </Link>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="column-full">
          <ul className="post-ul">
            {posts?.map((post) => (
              <PostCard key={post.postId} post={post} user={user} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

type PostProps = {
  post: Post;
  user: User;
};

function PostCard({ post, user }: PostProps) {
  return (
    <li className="post-card">
      <div className="row">
        <div className="column-half">
          <div className="post-header d-flex justify-between align-center">
            <span className="username">{user.username}</span>
            <Link to={`details/${post.postId}`}>
              <FaPencilAlt />
            </Link>
            <span className="timestamp">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          {post.textContent && (
            <div className="media-array margin-top-1">
              {post.mediaUrls.map((url, index) =>
                url.match(/\.(mp4|mov|webm)$/i) ? (
                  <video
                    key={index}
                    src={url}
                    controls
                    className="media-item"
                  />
                ) : (
                  <img
                    key={index}
                    src={url}
                    alt={`media-${index}`}
                    className="media-item"
                  />
                )
              )}
            </div>
          )}

          <Comments postId={post.postId} />
        </div>
      </div>
    </li>
  );
}
