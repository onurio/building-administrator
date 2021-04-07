import { Link } from '@reach/router';
import React, { useEffect, useRef, useState } from 'react';
import './Navbar.scss';
import { stack as Menu } from 'react-burger-menu';
import logo from '../assets/images/logo.png';

const NavLink = (props) => (
  <Link
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      return {
        className: isCurrent ? 'selected' : '',
      };
    }}
  />
);

const pages = [
  {
    title: 'Inicio',
    path: '/inicio',
  },
  {
    title: 'Obras',
    path: '/obras',
  },
  {
    title: 'Artistas',
    path: '/artistas',
  },
  {
    title: 'Exposiciones',
    path: '/exposiciones',
  },
  {
    title: 'Nosotros',
    path: '/nosotros',
  },
  {
    title: 'Contacto',
    path: '/contacto',
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((s) => !s);
  };

  return (
    <>
      <div className="navbar-mobile">
        <Menu onClose={toggle} isOpen={open} onOpen={toggle}>
          {pages.map((page) => (
            <NavLink onClick={toggle} key={page.path} to={page.path}>
              <li>{page.title}</li>
            </NavLink>
          ))}
        </Menu>{' '}
      </div>

      <nav className="navbar" role="navigation">
        <Link className="logo-container" to="/inicio">
          <img className="logo" src={logo} alt="Logo" />
          <h4 className="mobile-only">GALERÍA DE ARTE GATO TULIPÁN</h4>
        </Link>
        <div className="navbar-desktop">
          <ul>
            {pages.map((page) => (
              <NavLink key={page.path} to={page.path}>
                <li>{page.title}</li>
              </NavLink>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

{
  /* <nav className="navbar" role="navigation">
      <div>logo</div>
      <
      <ul>
        {pages.map((page) => (
          <Link key={page.path} to={page.path}>
            <li>{page.title}</li>
          </Link>
        ))}
      </ul>
    </nav> */
}
