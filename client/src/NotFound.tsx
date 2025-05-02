import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex">
      <div className="flex-1 py-12 text-center">
        <h3>Uh oh, we could not find the page you were looking for!</h3>
        <Link to="/" className="text-gray-700 cursor-pointer">
          Return to Feed
        </Link>
      </div>
    </div>
  );
}
