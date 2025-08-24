import { Route, Routes } from 'react-router-dom';
import ListBrandInner from '../component/ListBrandInner';
import ListProductInner from '../component/ListProductInner';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/list-brand' element={<ListBrandInner />} />
      <Route path='/list-product' element={<ListProductInner />} />
      <Route path='/' element={<ListProductInner />} />
    </Routes>
  );
};

export default AppRoutes;