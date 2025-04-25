import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useUser } from './useUser';

//later on add conditional render for logout button

export function Header() {
  const { user, handleSignOut } = useUser();
  const navigate = useNavigate();
  function handleClick(): void {
    handleSignOut();
    navigate('/');
  }
  return (
    <>
      <header className="border-b border-gray-200 mt-0 w-full">
        <nav className="bg-white w-full">
          <ul
            className=" flex items-center justify-center w-full "
            style={{ listStyle: 'none' }}>
            <li className="inline-block py-2 px-0">
              <Link to="/">
                <img
                  src="/images/gloveLogo.png"
                  alt="punch it boxing glove logo"
                  className="h-20 w-auto "
                />
              </Link>
            </li>
            <li className="flex-1 text-center py-2">
              <span
                className="text-5xl font-bold"
                style={{ fontFamily: 'Bangers' }}>
                Punch It
              </span>
            </li>
          </ul>
          {user ? (
            <button onClick={handleClick} className="entries-link white-text">
              <h3>Sign Out</h3>
            </button>
          ) : (
            <Link to="/auth/sign-in" className="entries-link white-text">
              <h3>Sign In</h3>
            </Link>
          )}
        </nav>
      </header>
      <Outlet />
    </>
  );
}
