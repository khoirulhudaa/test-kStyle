import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaChevronRight, FaFilter, FaList, FaSearch } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchBrands } from "../api/fetchBrand";
import { Block, Grid, Search } from "../assets";
import { brandsData } from "../data/brandsData";
import { DropDown, Footer, Navbar } from "../layout";
import { Brand } from "../types";
import Button from "./button";

const ListBrandInner = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalBrands, setTotalBrands] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<{ name?: string; brand?: string }>({});
  const [page, setPage] = useState<number>(1);
  const [activeBrand, setActiveBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [display, setDisplay] = useState<'grid' | 'block'>('grid');
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(false);
  const itemsPerPage = 5;

  const location = useLocation();
  const navigate = useNavigate();

  const { data: allBrands = [] } = useQuery<Brand[]>({
    queryKey: ['brandsAll'],
    queryFn: async () => {
      return new Promise<Brand[]>((resolve) => setTimeout(() => resolve(brandsData), 500));
    },
  });

  const { data: brandsResponse, isLoading, error } = useQuery<{ data: Brand[]; total: number }, Error>({
    queryKey: ['brands', queryParams, page],
    queryFn: () => fetchBrands(queryParams, page, itemsPerPage),
  });

  useEffect(() => {
    const nameStorage = localStorage.getItem('name');
    const newQueryParams: { name?: string; brand?: string } = {};

    localStorage.removeItem('brand');
    setActiveBrand('');

    if (nameStorage) {
      newQueryParams.name = nameStorage;
      setSearchQuery(nameStorage);
    }

    setQueryParams(newQueryParams);
    const newSearchParams = new URLSearchParams(newQueryParams);
    navigate({ search: newSearchParams.toString() }, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (brandsResponse) {
      setBrands(brandsResponse.data);
      setTotalBrands(brandsResponse.total);
    }
  }, [brandsResponse]);

  const handleMainMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleActiveSidebare = () => {
    setActive(!active);
  };

  const handleChangeQuery = (name: string, value: string) => {
    let newQueryParams = { ...queryParams };
    if (name === 'name') {
      if (value) {
        newQueryParams.name = value;
        localStorage.setItem('name', value);
        setSearchQuery(value);
      } else {
        delete newQueryParams.name;
        localStorage.removeItem('name');
        setSearchQuery('');
      }
    } else if (name === 'brand') {
      const selectedBrand = allBrands.find((b) => b.name === value);
      if (selectedBrand) {
        const brandId = selectedBrand.id.toString();
        newQueryParams.brand = brandId;
        localStorage.setItem('brand', brandId);
        setActiveBrand(value);
      } else {
        delete newQueryParams.brand;
        localStorage.removeItem('brand');
        setActiveBrand('');
      }
    }

    setQueryParams(newQueryParams);
    setPage(1);
    const newSearchParams = new URLSearchParams(newQueryParams);
    navigate({ search: newSearchParams.toString() });
  };

  const handleReset = () => {
    localStorage.removeItem('name');
    localStorage.removeItem('brand');
    setQueryParams({});
    setActiveBrand('');
    setSearchQuery('');
    setPage(1);
    navigate('/list-brand');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalBrands / itemsPerPage);

  return (
    <>
      <Navbar onClick={handleActiveSidebare} active={active} />

      <section className="w-screen px-[20px] md:px-[60px] py-[10px] h-max flex">
        <div className="w-full flex items-center py-[10px]">
          <p className="flex items-center">
            <Link to="/" className="text-blue-500">Home</Link>
            <FaChevronRight size={13} style={{ fontSize: '10px', marginLeft: '6px', marginRight: '6px' }} />
            <p className="text-slate-500">{location.pathname.substring(1)}</p>
          </p>
        </div>
      </section>

      <section className="w-full flex h-max px-[20px] md:px-[60px]">
        <div className="md:block hidden w-[20%] h-max pb-[20px] px-[0px] border-b border-b-slate-300 border-t-slate-300">
          <Button
            text="Reset Filters"
            type="outline-with-icon"
            style={`${activeBrand === '' ? 'bg-slate-200 text-slate-400 active:scale-[1] cursor-not-allowed' : ''} mb-8`}
            disabled={activeBrand === ''}
            handleClick={handleReset}
            icon={<FaFilter />}
          />
          <DropDown
            title="Brand"
            onClick={handleChangeQuery.bind(null, 'brand')}
            listMenu={allBrands.map((b) => b.name)}
            active={activeBrand}
          />
        </div>

        <div
          className={`w-full md:w-[80%] overflow-y-auto transition-all duration-300 ease ${
            showMenu ? 'h-max opacity-100' : 'h-[80px] overflow-y-hidden'
          }`}
        >
          <div className="w-[96%] ml-auto py-[14px] rounded-lg border-2 border-slate-300 bg-slate-100 mb-[20px] p-[12px] flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center w-full md:w-auto">
              <p className="mr-4">
                {totalBrands} brands <b className="md:flex hidden">{activeBrand || 'By K-Style Hub'}</b>
              </p>
            </div>
            <div className="w-full md:w-max flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => handleChangeQuery('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search brands by name"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-500 flex items-center gap-3 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                aria-label="View all products"
              >
                <p>
                  View All Products
                </p>
                <FaList size={16} />
              </button>
              <div
                onClick={handleMainMenu}
                className="w-[35px] rounded-lg border-2 border-slate-300 h-[35px] flex items-center justify-center cursor-pointer hover:brightness-[80%] duration-200"
              >
                <FaChevronRight size={14} style={{ transition: '0.4s ease', transform: `rotate(${showMenu ? '90deg' : '0deg'})` }} />
              </div>
              <div
                onClick={() => setDisplay('block')}
                className={`${
                  display === 'block' ? 'bg-blue-200 text-white' : ''
                } w-[35px] mx-2 rounded-lg border-2 border-slate-300 h-[35px] flex items-center justify-center cursor-pointer duration-200`}
              >
                <img src={Grid} alt="gridMode" className="w-[60%] opacity-[0.7]" />
              </div>
              <div
                onClick={() => setDisplay('grid')}
                className={`${
                  display === 'grid' ? 'bg-blue-200 text-white' : ''
                } w-[35px] rounded-lg border-2 border-slate-300 h-[35px] flex items-center justify-center cursor-pointer hover:brightness-[80%] duration-200`}
              >
                <img src={Block} alt="blockMode" className="w-[50%] opacity-[0.7]" />
              </div>
            </div>
          </div>

          <div className="w-[96%] ml-auto flex flex-wrap justify-start h-max px-[10px] py-[20px] md:p-[20px] bg-slate-100 rounded-lg overflow-hidden">
            {isLoading ? (
              <div>Loading brands...</div>
            ) : error ? (
              <div>Error: {error.message}</div>
            ) : brands.length > 0 ? (
              brands.map((brand, index) => (
                <div
                  key={index}
                  className={`${
                    display === 'grid' ? 'flex w-full mr-0 h-[180px]' : 'block w-full md:w-[31%] mx-2 h-max'
                  } rounded-xl bg-white shadow-md mb-6 overflow-hidden transition-all duration-200 hover:shadow-lg`}
                >
                  <div
                    className={`${
                      display === 'grid' ? 'w-[30%] h-full' : 'w-full h-[150px]'
                    } p-4 flex items-center justify-center overflow-hidden`}
                  >
                    <div className="w-[94%] h-[94%] border border-black/20 overflow-hidden rounded-lg">
                      <img
                        src={brand.image}
                        alt={`Brand image of ${brand.name}`}
                        className="rounded-lg w-full h-full object-cover transition-transform duration-500 hover:scale-[1.4]"
                      />
                    </div>
                  </div>
                  <div
                    className={`${
                      display === 'grid' ? 'w-full md:w-[70%]' : 'w-full'
                    } relative border-l border-gray-200 h-[90%] px-5 py-4 flex flex-col justify-between`}
                  >
                    <h3 className="text-gray-900 text-lg font-semibold mb-2">{brand.name}</h3>
                    <div className="flex items-center mt-4 gap-3">
                      <Link
                        to={`/list-product?brand=${brand.id}`}
                        className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors duration-150"
                        aria-label={`View products for ${brand.name}`}
                      >
                        View Products
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center">
                <img src={Search} alt="searchIcon" className="w-[40px] mr-3" />
                <p>No brands found.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center mt-4 gap-2">
            <Button
              text="First"
              handleClick={() => {
                scrollToTop();
                setPage(1);
              }}
              disabled={page === 1}
            />
            <Button
              type="default-with-icon"
              icon={<FaArrowLeft />}
              handleClick={() => {
                scrollToTop();
                setPage((prev) => Math.max(prev - 1, 1));
              }}
              disabled={page === 1}
            />
            <span className="mx-4">Page {page} of {totalPages}</span>
            <Button
              type="default-with-icon"
              icon={<FaArrowRight />}
              handleClick={() => {
                scrollToTop();
                setPage((prev) => Math.min(prev + 1, totalPages));
              }}
              disabled={page === totalPages}
            />
            <Button
              text="Last"
              handleClick={() => {
                scrollToTop();
                setPage(totalPages);
              }}
              disabled={page === totalPages}
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ListBrandInner;