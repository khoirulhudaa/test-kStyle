import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCartPlus, FaChevronRight, FaEye, FaFilter, FaList, FaSearch, FaTimes } from "react-icons/fa";
import Modal from 'react-modal';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchColors } from "../api/fetchColors";
import { fetchProductDetails } from "../api/fetchProductDetails";
import { fetchProducts } from "../api/fetchProducts";
import { fetchSizes } from "../api/fetchSize";
import { Block, Grid, Search } from "../assets";
import { brandsData } from "../data/brandsData";
import { detailProductsData } from "../data/detailProductsData";
import { sizesData } from "../data/sizesData";
import toRupiah from "../helpers/toRupiah";
import { DropDown, Footer, Navbar } from "../layout";
import { Brand, Product, ProductDetail } from "../types";
import Button from "./button";

// Set app element for accessibility
Modal.setAppElement('#root');

const ListProductInner = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<{ brand?: string; size?: string; color?: string; name?: string }>({});
  const [page, setPage] = useState<number>(1);
  const [activeBrand, setActiveBrand] = useState<string>('');
  const [activeSize, setActiveSize] = useState<string>('');
  const [activeColor, setActiveColor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [display, setDisplay] = useState<'grid' | 'block'>('grid');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [cart, setCart] = useState<{ [key: string]: number }>({}); // Track cart items and their counts

  const navigate = useNavigate();
  const location = useLocation();
  const itemsPerPage = 5;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (name: string) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      updatedCart[name] = (updatedCart[name] || 0) + 1; // Increment count for the product
      const count = updatedCart[name];
      setAlertMessage(`Added ${name} to cart (${count} ${count === 1 ? 'item' : 'items'})`);
      return updatedCart;
    });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

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
      const selectedBrand = brands.find((b) => b.name === value);
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
    } else if (name === 'size') {
      if (sizes.includes(value)) {
        newQueryParams.size = value;
        localStorage.setItem('size', value);
        setActiveSize(value);
      } else {
        delete newQueryParams.size;
        localStorage.removeItem('size');
        setActiveSize('');
      }
    } else if (name === 'color') {
      if (colors.includes(value)) {
        newQueryParams.color = value;
        localStorage.setItem('color', value);
        setActiveColor(value);
      } else {
        delete newQueryParams.color;
        localStorage.removeItem('color');
        setActiveColor('');
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
    localStorage.removeItem('size');
    localStorage.removeItem('color');
    setQueryParams({});
    setActiveBrand('');
    setActiveSize('');
    setActiveColor('');
    setSearchQuery('');
    setPage(1);
    navigate('/list-product');
  };

  const openModal = (id: number) => {
    setSelectedProductId(id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProductId(null);
  };

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brandsAll'],
    queryFn: async () => {
      return new Promise<Brand[]>((resolve) => setTimeout(() => resolve(brandsData), 500));
    },
  });

  const { data: sizes = [] } = useQuery<string[]>({
    queryKey: ['sizes'],
    queryFn: fetchSizes,
  });

  const { data: colors = [] } = useQuery<string[]>({
    queryKey: ['colors'],
    queryFn: fetchColors,
  });

  const { data: productsResponse, isLoading, error } = useQuery<{ data: Product[]; total: number }, Error>({
    queryKey: ['products', JSON.stringify(queryParams), page],
    queryFn: () => {
      console.log('Fetching products with params:', queryParams, 'page:', page);
      return fetchProducts(queryParams, page, itemsPerPage);
    },
  });

  const { data: productDetails } = useQuery<{ product: Product | undefined; details: ProductDetail[] }, Error>({
    queryKey: ['productDetails', selectedProductId],
    queryFn: () => fetchProductDetails(selectedProductId!),
    enabled: !!selectedProductId,
  });

  useEffect(() => {
    localStorage.removeItem('name');
    const params = new URLSearchParams(location.search);
    const brandId = params.get('brand');
    const nameStorage = localStorage.getItem('name');
    const sizeStorage = localStorage.getItem('size');
    const colorStorage = localStorage.getItem('color');

    const newQueryParams: { brand?: string; size?: string; color?: string; name?: string } = {};

    if (!brandId && !localStorage.getItem('brand') && brands[0]) {
      newQueryParams.brand = brands[0].id.toString();
      localStorage.setItem('brand', brands[0].id.toString());
      setActiveBrand('');
    } else if (brandId) {
      newQueryParams.brand = brandId;
      const selectedBrand = brands.find((b) => b.id === parseInt(brandId));
      setActiveBrand(selectedBrand ? selectedBrand.name : '');
    } else if (localStorage.getItem('brand')) {
      newQueryParams.brand = localStorage.getItem('brand')!;
      const selectedBrand = brands.find((b) => b.id.toString() === localStorage.getItem('brand'));
      setActiveBrand(selectedBrand ? selectedBrand.name : '');
    }

    if (nameStorage) {
      newQueryParams.name = nameStorage;
      setSearchQuery(nameStorage);
    }

    if (sizeStorage && sizes.includes(sizeStorage)) {
      newQueryParams.size = sizeStorage;
      setActiveSize(sizeStorage);
    }

    if (colorStorage && colors.includes(colorStorage)) {
      newQueryParams.color = colorStorage;
      setActiveColor(colorStorage);
    }

    setQueryParams(newQueryParams);
    const newSearchParams = new URLSearchParams(newQueryParams);
    navigate({ search: newSearchParams.toString() }, { replace: true });
  }, [brands, sizes, colors, location.search, navigate]);

  useEffect(() => {
    if (productsResponse) {
      setProducts(productsResponse.data);
      setTotalProducts(productsResponse.total);
    }
  }, [productsResponse]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return (
    <>
      <Navbar onClick={handleActiveSidebare} active={active} />

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg border border-blue-800"
          >
            <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-sm font-medium">{alertMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="md:block hidden w-[20%] h-max border-b border-b-slate-300 pb-[20px] px-[0px] border-t-slate-300">
          <Button
            text="Reset Filters"
            type="outline-with-icon"
            disabled={(activeColor === '' && activeSize === '' && activeBrand === 'Innisfree')}
            style={`${((activeColor === '' && activeSize === '') && activeBrand === 'Innisfree') ? 'bg-slate-200 text-slate-400 active:scale-[1] cursor-not-allowed' : ''} mb-8`}
            handleClick={handleReset}
            icon={<FaFilter />}
          />
          <DropDown
            title="Brand products"
            onClick={handleChangeQuery.bind(null, 'brand')}
            listMenu={brands.map((b) => b.name)}
            active={activeBrand}
          />
          <DropDown
            title="Size products"
            onClick={handleChangeQuery.bind(null, 'size')}
            listMenu={sizes}
            active={activeSize}
          />
          <DropDown
            title="Color products"
            onClick={handleChangeQuery.bind(null, 'color')}
            listMenu={colors}
            active={activeColor}
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
                {totalProducts} items in brand{' '}
                <b className="md:flex hidden">
                  {activeBrand || 'All brands'}, {activeSize || 'All sizes'}, {activeColor || 'All colors'}
                </b>
              </p>
            </div>
            <div className="w-full md:w-max flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleChangeQuery('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search products by name"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => navigate('/list-brand')}
                className="bg-blue-500 flex items-center gap-3 text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-200"
                aria-label="View all brands"
              >
                <p>
                    View All Brands
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
                className={`${display === 'block' ? 'bg-blue-200 text-white' : ''} w-[35px] mx-2 rounded-lg border-2 border-slate-300 h-[35px] flex items-center justify-center cursor-pointer duration-200`}
              >
                <img src={Grid} alt="gridMode" className="w-[60%] opacity-[0.7]" />
              </div>
              <div
                onClick={() => setDisplay('grid')}
                className={`${display === 'grid' ? 'bg-blue-200 text-white' : ''} w-[35px] rounded-lg border-2 border-slate-300 h-[35px] flex items-center justify-center cursor-pointer hover:brightness-[80%] duration-200`}
              >
                <img src={Block} alt="blockMode" className="w-[50%] opacity-[0.7]" />
              </div>
            </div>
          </div>

          <div className="w-[96%] ml-auto flex flex-wrap justify-start h-max px-[10px] py-[20px] md:p-[20px] bg-slate-100 rounded-lg overflow-hidden">
            {isLoading ? (
              <div>Loading products...</div>
            ) : error ? (
              <div>Error: {error.message}</div>
            ) : products.length > 0 ? (
              <>
                {products.map((data, index) => {
                  const productVariants = detailProductsData.filter((dp) => dp.productId === data.id);
                  const filteredSizes = activeSize
                    ? productVariants.filter((dp) => dp.size === activeSize).map((dp) => dp.size)
                    : [...new Set(productVariants.map((dp) => dp.size))];
                  const uniqueSizes = [...new Set(filteredSizes)].slice(0, 3);
                  const filteredColors = activeColor
                    ? productVariants.filter((dp) => dp.color === activeColor).map((dp) => dp.color)
                    : [...new Set(productVariants.map((dp) => dp.color))];
                  const uniqueColors = [...new Set(filteredColors)].slice(0, 3);

                  return (
                    <div
                      key={index}
                      className={`${
                        display === 'grid' ? 'flex w-full mr-0 h-[280px]' : 'block w-full md:w-[31%] mx-2 h-max'
                      } rounded-xl bg-white shadow-md mb-6 overflow-hidden transition-all duration-200 hover:shadow-lg`}
                    >
                      <div
                        className={`${display === 'grid' ? 'w-[30%] h-full' : 'w-full h-[200px]'} p-4 flex items-center justify-center overflow-hidden`}
                      >
                        <div className="w-[94%] h-[94%] border border-black/20 overflow-hidden rounded-lg">
                          <img
                            src={data.image}
                            alt={`Product image of ${data.name}`}
                            className="rounded-lg w-full h-full object-cover transition-transform duration-500 hover:scale-[1.4]"
                          />
                        </div>
                      </div>
                      <div
                        className={`${
                          display === 'grid' ? 'w-full md:w-[70%]' : 'w-full'
                        } relative border-l border-gray-200 h-[90%] px-5 py-4 flex flex-col justify-between`}
                      >
                        {display === 'grid' && (
                          <div className="absolute bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-full px-3 py-1 right-4 top-4">
                            {page === 1 ? index + 1 : index + 6} / {data.shop_name}
                          </div>
                        )}
                        <div>
                          <h3 className="text-gray-900 text-lg font-semibold mb-2">{data.name}</h3>
                          <div className={`flex gap-2 mb-3 ${display === 'block' ? 'flex-raw' : 'flex-wrap'}`}>
                            <div className={`flex ${display === 'block' ? 'flex-row gap-1' : 'flex-wrap gap-1'}`}>
                              {uniqueSizes.length > 0 ? (
                                uniqueSizes.slice(0, 1).map((size, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center ${
                                      display === 'block' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
                                    } font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 cursor-pointer transition-colors duration-150 whitespace-nowrap`}
                                    title={`Filter by size: ${size}`}
                                    aria-label={`Size: ${size}`}
                                  >
                                    {size}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">No sizes available</span>
                              )}
                            </div>
                            <div className={`flex ${display === 'block' ? 'flex-row gap-1' : 'flex-wrap gap-1'}`}>
                              {uniqueColors.length > 0 ? (
                                uniqueColors.slice(0, 1).map((color, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center ${
                                      display === 'block' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
                                    } font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 cursor-pointer transition-colors duration-150 whitespace-nowrap`}
                                    title={`Filter by color: ${color}`}
                                    aria-label={`Color: ${color}`}
                                  >
                                    {color}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">No colors available</span>
                              )}
                            </div>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{toRupiah(data.price)}</h2>
                          <p className={`${display === 'grid' ? 'block' : 'hidden'} text-sm text-gray-500 leading-relaxed line-clamp-2`}>
                            {data.description}
                          </p>
                        </div>
                        <div className={`${display === 'grid' ? 'flex' : 'flex-col flex'} items-center mt-4 gap-3 sm:gap-4`}>
                          <button
                            className={`${display === 'block' ? 'w-full' : ''} flex gap-3 rounded-md border border-blue-500 text-blue-600 hover:text-blue-800 hover:border-blue-800 font-semibold justify-center items-center text-sm px-3 py-2 transition-all duration-200 hover:shadow-md`}
                            onClick={() => openModal(data.id)}
                            aria-label={`View details for ${data.name}`}
                          >
                            View Details
                            <FaEye size={16} />
                          </button>
                          <button
                            className={`${display === 'block' ? 'w-full' : ''} flex gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-3 py-[8.6px] rounded-md items-center justify-center transition-all duration-200 hover:shadow-md`}
                            onClick={() => handleAddToCart(data.name)}
                            aria-label={`Add ${data.name} to cart`}
                          >
                            {
                                cart[data.name] ? (
                                    <p className="text-white font-semibold text-sm">
                                    {cart[data.name]} {cart[data.name] === 1 ? 'item' : 'items'} in Cart
                                    </p>
                                ) : (
                                    <p className="text-white font-semibold text-sm">
                                        Add to Cart
                                    </p>
                                )
                            }
                            <FaCartPlus size={16} className="mr-[1px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="flex items-center">
                <img src={Search} alt="searchIcon" className="w-[40px] mr-3" />
                <p>
                  No products found for the selected filters:{' '}
                  <b>
                    {activeBrand || 'all brands'}, {activeSize || 'all sizes'}, {activeColor || 'all colors'}
                  </b>
                </p>
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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center justify-center z-50 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative transform transition-all duration-300 scale-100 opacity-100">
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 shadow-sm"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
          {productDetails ? (
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 flex flex-col justify-between items-center">
                <img
                    src={productDetails.product?.image}
                    alt="product"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <button
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center gap-2"
                    onClick={() => handleAddToCart(productDetails.product?.name || '')}
                    aria-label={`Add ${productDetails.product?.name || ''} to cart`}
                >
                    <FaCartPlus />
                    {cart[productDetails.product?.name || ''] ? (
                    <span className="text-white font-semibold text-sm">
                        {cart[productDetails.product?.name || '']} {cart[productDetails.product?.name || ''] === 1 ? 'item' : 'items'} in Cart
                    </span>
                    ) : (
                    <span className="text-white font-semibold text-sm">Add to Cart</span>
                    )}
                </button>
                </div>
                <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-2">{productDetails.product?.name}</h2>
                <p className="text-gray-600 mb-4 text-sm">{productDetails.product?.description}</p>
                <h3 className="text-xl font-semibold mb-4">
                    {productDetails.product ? toRupiah(productDetails.product.price) : ''}
                </h3>
                <h4 className="font-bold mb-2">Available Variants:</h4>
                <table className="w-full border-collapse text-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Size</th>
                        <th className="border p-2 text-left">Color</th>
                        <th className="border p-2 text-left">Stock</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sizesData.map((size, idx) => {
                        const detail = productDetails.details.find((d) => d.size === size);
                        return detail ? (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border p-2">{detail.size}</td>
                            <td className="border p-2">{detail.color}</td>
                            <td className="border p-2">{detail.stock}</td>
                        </tr>
                        ) : null;
                    })}
                    </tbody>
                </table>
                </div>
            </div>
            ) : (
            <p className="text-center text-gray-500">Loading details...</p>
            )}
        </div>
      </Modal>

      <Footer />
    </>
  );
};

export default ListProductInner;