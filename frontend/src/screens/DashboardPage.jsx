import React, { useState, useEffect, useCallback } from 'react';
import config from '../constants.js';
import { ArrowRightOnRectangleIcon, BuildingStorefrontIcon, PlusIcon, PhotoIcon, CurrencyDollarIcon, TagIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Feature-Aware Component: ImageUploader
const ImageUploader = ({ onFileSelect, preview, setPreview }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      onFileSelect(file);
    } else {
      onFileSelect(null);
      setPreview(null);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileChange(e.dataTransfer.files[0]);
      }}
    >
      <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0])} />
      <label htmlFor="file-upload" className="cursor-pointer">
        {preview ? (
            <div className='relative group'>
                <img src={preview} alt="Preview" className="mx-auto max-h-40 rounded-md" />
                 <div onClick={(e) => { e.preventDefault(); handleFileChange(null); }} className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <XMarkIcon className='h-4 w-4'/>
                </div>
            </div>
        ) : (
          <div className="text-gray-500">
            <PhotoIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">Drag & drop or <span className='font-semibold text-blue-600'>click to upload</span></p>
          </div>
        )}
      </label>
    </div>
  );
};

// Feature-Aware Component: ChoiceSelector
const ChoiceSelector = ({ options, selected, onSelect, label }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selected === option ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const RestaurantForm = ({ manifest, onRestaurantCreated, existingRestaurant }) => {
    const [name, setName] = useState(existingRestaurant?.name || '');
    const [description, setDescription] = useState(existingRestaurant?.description || '');
    const [cuisine, setCuisine] = useState(existingRestaurant?.cuisine || 'American');
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [preview, setPreview] = useState(existingRestaurant?.coverPhoto?.thumbnail.url || null);
    const cuisineOptions = ['Italian', 'Mexican', 'Japanese', 'American', 'Indian'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const restaurantData = { name, description, cuisine };
        if (coverPhoto) {
            restaurantData.coverPhoto = coverPhoto;
        }

        try {
            let newRestaurant;
            if (existingRestaurant) {
                newRestaurant = await manifest.from('Restaurant').update(existingRestaurant.id, restaurantData);
            } else {
                newRestaurant = await manifest.from('Restaurant').create(restaurantData);
            }
            onRestaurantCreated(newRestaurant, !!existingRestaurant);
            // Reset form if creating new
            if (!existingRestaurant) {
                setName('');
                setDescription('');
                setCuisine('American');
                setCoverPhoto(null);
                setPreview(null);
            }
        } catch (error) {
            console.error('Failed to save restaurant:', error);
            alert('Error saving restaurant.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">{existingRestaurant ? 'Edit Restaurant' : 'Add a New Restaurant'}</h3>
            <div>
                <label htmlFor="res-name" className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                <input type="text" id="res-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="res-desc" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="res-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
            <ChoiceSelector options={cuisineOptions} selected={cuisine} onSelect={setCuisine} label="Cuisine" />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
                <ImageUploader onFileSelect={setCoverPhoto} preview={preview} setPreview={setPreview} />
            </div>
            <button type="submit" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                {existingRestaurant ? 'Save Changes' : 'Create Restaurant'}
            </button>
        </form>
    )
}

export default function DashboardPage({ user, onLogout, manifest }) {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await manifest.from('Restaurant').find({ include: ['owner'], sort: { createdAt: 'desc' } });
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  }, [manifest]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleRestaurantCreated = (newRestaurant, isUpdate) => {
      if (isUpdate) {
          setRestaurants(restaurants.map(r => r.id === newRestaurant.id ? newRestaurant : r));
      } else {
          setRestaurants([newRestaurant, ...restaurants]);
      }
  }

  const deleteRestaurant = async (restaurantId) => {
    if (window.confirm('Are you sure you want to delete this restaurant and all its menu items?')) {
        try {
            await manifest.from('Restaurant').delete(restaurantId);
            setRestaurants(restaurants.filter(r => r.id !== restaurantId));
        } catch(err) {
            console.error('Failed to delete restaurant', err);
            alert('Could not delete restaurant.');
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">FoodieFinds</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div>
                <p className='text-sm font-medium text-gray-800'>{user.name}</p>
                <p className='text-xs text-gray-500 capitalize'>{user.role}</p>
            </div>
            <button onClick={onLogout} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <ArrowRightOnRectangleIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${user.role === 'chef' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          {/* Role-Based UI: Chef's tools on the side */}
          {user.role === 'chef' && (
            <div className="lg:col-span-1 space-y-6">
              <RestaurantForm manifest={manifest} onRestaurantCreated={handleRestaurantCreated} />
            </div>
          )}

          {/* Main content area */}
          <div className={user.role === 'chef' ? 'lg:col-span-2' : 'lg:col-span-1'}>
             <h2 className="text-2xl font-semibold text-gray-800 mb-6">Restaurants</h2>
             {isLoading ? <p>Loading restaurants...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {restaurants.length > 0 ? restaurants.map(restaurant => (
                        <div key={restaurant.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                            <img src={restaurant.coverPhoto?.thumbnail.url || 'https://via.placeholder.com/400x300'} alt={restaurant.name} className="w-full h-48 object-cover" />
                            <div className='p-4'>
                                <div className='flex justify-between items-start'>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                                        <p className="text-sm text-gray-500">By {restaurant.owner?.name || 'Unknown'}</p>
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mt-2 px-2.5 py-0.5 rounded-full">{restaurant.cuisine}</span>
                                    </div>
                                    {user.id === restaurant.ownerId && (
                                        <div className='flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <button className='p-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200'><PencilSquareIcon className='h-5 w-5'/></button>
                                            <button onClick={() => deleteRestaurant(restaurant.id)} className='p-1.5 bg-red-100 rounded-full text-red-500 hover:bg-red-200'><TrashIcon className='h-5 w-5'/></button>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-gray-700 text-sm">{restaurant.description}</p>
                                {/* TODO: Add Menu Item management here */}
                            </div>
                        </div>
                    )) : <p className='text-gray-600 md:col-span-2'>No restaurants found. {user.role === 'chef' ? 'Add your first one!' : ''}</p>}
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
