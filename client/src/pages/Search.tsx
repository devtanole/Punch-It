import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../components/UserContext';

export function UserSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);

    if (query.trim() === '') {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?username=${query}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const users: User[] = await response.json();
      setResults(users);
    } catch (err) {
      setError(error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
      />
      {error && <div>{error}</div>}
      <ul>
        {results.map((user) => (
          <li key={user.userId}>
            <Link to={`/profile/${user.userId}`}> {user.username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
