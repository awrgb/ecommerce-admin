import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';

function Categories({swal}) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name,setName] = useState('');
  const [parentCategory,setParentCategory] = useState('');
  const [categories,setCategories] = useState([]);
  const [properties,setProperties] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, [])
  function fetchCategories() {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    });
  }
  async function saveCategory(ev){
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      properties:properties.map(p => ({
        name:p.name,
        values:p.values.split(','),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put('/api/categories', data);
      setEditedCategory(null);
    } else {
      await axios.post('/api/categories', data);
    }
    setName('');
    setParentCategory('');
    setProperties([]);
    fetchCategories();
  }
  function editCategory(category){
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({name,values}) => ({
      name,
      values:values.join(',')
    }))
    );
  }
  function deleteCategory(category){
    swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${category.name}?`,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, Delete!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    }).then(async result => {
      if (result.isConfirmed) {
        const {_id} = category;
        await axios.delete('/api/categories?_id='+_id);
        fetchCategories();
      }
    });
  }
  function addProperty() {
    setProperties(prev => {
      return [...prev, {name:'',values:''}];
    });
  }
  function handlePropertyNameChange(index,property,newName) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  function handlePropertyValuesChange(index,property,newValues) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }
  function removeProperty(indexToRemove) {
    setProperties(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }
  return (
    <Layout>
  <h1 className="text-2xl font-bold mb-4  px-4 py-2 border border-blue-500 hover:bg-blue-100 hover:border-blue-600 hover:text-blue-600 rounded-md">Categories</h1>
  <label className="block mb-2">
    {editedCategory
      ? `Edit category ${editedCategory.name}`
      : 'Create new category'}
  </label>
  <form onSubmit={saveCategory} className="mb-4">
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
      />
      <select
        onChange={(ev) => setParentCategory(ev.target.value)}
        value={parentCategory}
        className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
      >
        <option value="">No parent category</option>
        {categories.length > 0 &&
          categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
      </select>
    </div>
    <div className="mb-4">
      <label className="block mb-2">Properties</label>
      <button
  onClick={addProperty}
  type="button"
  className="btn-default py-1 px-4 rounded-xl text-sm mb-2 bg-blue-500 hover:bg-blue-600 text-white"
>
  Add new property
</button>

      {properties.length > 0 &&
        properties.map((property, index) => (
          <div key={property.name} className="flex gap-2 items-center">
            <input
              type="text"
              value={property.name}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
              onChange={(ev) =>
                handlePropertyNameChange(index, property, ev.target.value)
              }
              placeholder="Property name (example: color)"
            />
            <input
              type="text"
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
              onChange={(ev) =>
                handlePropertyValuesChange(
                  index,
                  property,
                  ev.target.value
                )
              }
              value={property.values}
              placeholder="Values, comma separated"
            />
            <button
              onClick={() => removeProperty(index)}
              type="button"
              className="btn-red py-1 px-4 rounded-md"
            >
              Remove
            </button>
          </div>
        ))}
    </div>
    <div className="flex gap-4">
      {editedCategory && (
        <button
          type="button"
          onClick={() => {
            setEditedCategory(null);
            setName('');
            setParentCategory('');
            setProperties([]);
          }}
          className="btn-default py-1 px-4 rounded-md"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        className="btn-primary py-1 px-4 rounded-md"
      >
        Save
      </button>
    </div>
  </form>
  {!editedCategory && (
    <table className="basic mt-4 w-full">
      <thead>
        <tr>
          <td className="px-4 py-2">Category name</td>
          <td className="px-4 py-2">Parent category</td>
          <td className="px-4 py-2"></td>
        </tr>
      </thead>
      <tbody>
        {categories.length > 0 &&
          categories.map((category) => (
            <tr key={category._id} className="hover:bg-gray-100">
              <td className="px-4 py-2">{category.name}</td>
              <td className="px-4 py-2">{category?.parent?.name}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => editCategory(category)}
                  className="btn-default py-1 px-4 rounded-md mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category)}
                  className="btn-red py-1 px-4 rounded-md"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )}
</Layout>

  );
}

export default withSwal(({swal}, ref) => (
  <Categories swal={swal} />
));
