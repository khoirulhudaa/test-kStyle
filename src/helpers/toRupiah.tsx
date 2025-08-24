const formatToRupiah = (angka: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  })
    .format(angka)
    .replace(/\s/g, ''); // Remove any spaces between the symbol and the number
};

export default formatToRupiah