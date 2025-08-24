## 🚀 Langkah Menjalankan Proyek

```bash

git clone <repository-url>

cd <project-directory>

npm i --legacy-peer-deps 

npm run dev

access => http://localhost:3000
```

---------------------------------------------------------------------------

## ✅Pemahaman Mengenai Props dengan TypeScript

Sebagai frontend developer, menurut saya props di TypeScript itu bukan cuma soal menentukan tipe saja, tapi lebih ke cara menjaga struktur dan kontrak antar komponen biar tetap jelas dan aman.

Dengan TypeScript, props dapat didefinisikan dengan tipe data yang ketat menggunakan interface atau type. Ini memastikan bahwa data yang dikirimkan ke komponen sesuai dengan tipe yang diharapkan, mengurangi risiko kesalahan selama pengembangan.

### Contoh:
```jsx
  interface MyComponentProps {
    name: string;
    age?: number;
    onClick: () => void;
  }
  
  const MyComponent: React.FC<MyComponentProps> = ({ name, age, onClick }) => {
    return (
      <div>
        <p>Hello, {name}!</p>
        {age && <p>Age: {age}</p>}
        <button onClick={onClick}>Click Me</button>
      </div>
    );
  };
```

## ✅Pemahaman Saya Mengenai TanStack

TanStack, khususnya TanStack Query (dulu dikenal sebagai React Query), menurut saya adalah game-changer banget dalam hal data fetching dan manajemen async state di React.

Dulu, kita sering banget repot dengan kombinasi useEffect, useState, dan berbagai kondisi loading, error, success—yang bikin logic jadi berantakan. Dengan TanStack Query, semua itu bisa ditangani dengan cara yang jauh lebih clean dan efisien.

### contoh
```jsx
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
```
