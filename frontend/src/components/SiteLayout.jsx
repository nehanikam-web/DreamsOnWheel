import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function SiteLayout() {
  return (
    <>
      <Navbar />
      <main className="site-main"><Outlet /></main>
      <Footer />
    </>
  );
}
