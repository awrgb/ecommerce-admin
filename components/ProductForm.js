import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import Image from "next/image";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [price, setPrice] = useState(existingPrice || "");
  const [videoLinks, setVideoLinks] = useState([]);
  const [goToProducts, setGoToProducts] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const [images, setImages] = useState(existingImages || []);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      videoLinks,
      category,
      properties: productProperties,
    };
    if (_id) {
      //update
      await axios.put("/api/products", { ...data, _id });
    } else {
      //create
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push("/products");
  }

  function handleImageUrlInputChange(index, newValue) {
    const newImages = [...images];
    newImages[index] = newValue;
    setImages(newImages);
  }

  function handleAddImage() {
    setImages([...images, ""]);
  }

  function handleRemoveImage(index) {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  }

  function handleImageSort(newImages) {
    setImages(newImages);
  }

  function handleAddVideoLink() {
    setVideoLinks([...videoLinks, ""]);
  }

  function handleVideoLinkChange(index, newValue) {
    const newVideoLinks = [...videoLinks];
    newVideoLinks[index] = newValue;
    setVideoLinks(newVideoLinks);
  }

  function handleRemoveVideoLink(index) {
    const newVideoLinks = videoLinks.filter((_, i) => i !== index);
    setVideoLinks(newVideoLinks);
  }

  return (
    <form onSubmit={saveProduct} className="p-4 bg-white rounded-lg shadow-md">
      <label className="text-lg font-bold mb-2 block">Product Form</label>
      <div className="mb-4">
        <label htmlFor="productName" className="block mb-1">
          Product Name
        </label>
        <input
          id="productName"
          type="text"
          placeholder="Product Name"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="category" className="block mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(ev) => setCategory(ev.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
        >
          <option value="">Uncategorized</option>
          {categories.length > 0 &&
            categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Photos</label>
        <div className="flex flex-wrap gap-4">
          <ReactSortable list={images} setList={handleImageSort} className="flex flex-wrap gap-4">
            {images.map((link, index) => (
              <div key={index} className="relative group">
                <Image src={link} alt="" className="w-24 h-24 object-cover rounded-md transition-all duration-300 transform group-hover:scale-105" />
                <button
                  type="button"
                  className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white transition-all duration-300 transform group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => handleRemoveImage(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </ReactSortable>
          <div className="relative group">
            <input
              type="text"
              placeholder="Image URL"
              className="w-24 h-24 object-cover rounded-md border border-gray-300 focus:outline-none focus:border-primary"
              value=""
              onChange={(ev) => handleImageUrlInputChange(images.length, ev.target.value)}
            />
            <button
              type="button"
              className="absolute top-0 right-0 p-1 bg-green-500 rounded-full text-white transition-all duration-300 transform group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={handleAddImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block mb-1">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Description"
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="price" className="block mb-1">
          Price (in USD)
        </label>
        <input
          id="price"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(ev) => setPrice(ev.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        className="block w-full py-2 px-4 bg-primary text-white rounded-md shadow-md transition-all duration-300 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark"
      >
        Save
      </button>
    </form>
  );
}
