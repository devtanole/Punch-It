import { Outlet, Link } from 'react-router-dom';

//later on add conditional render for logout button

export function Header() {
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
        </nav>
      </header>

      <Outlet />
    </>
  );
}
