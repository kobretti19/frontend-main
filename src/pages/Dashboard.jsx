import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBrands } from '../redux/slices/brandsSlice';
import { fetchCategories } from '../redux/slices/categoriesSlice';
import { fetchColors } from '../redux/slices/colorsSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import { fetchEquipment } from '../redux/slices/equipmentSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const brands = useSelector((state) => state.brands.items || []);
  const categories = useSelector((state) => state.categories.items || []);
  const colors = useSelector((state) => state.colors.items || []);
  const parts = useSelector((state) => state.parts.items || []);
  const equipment = useSelector((state) => state.equipment.items || []);

  useEffect(() => {
    dispatch(fetchBrands()).catch((err) =>
      console.error('Failed to fetch brands:', err)
    );
    dispatch(fetchCategories()).catch((err) =>
      console.error('Failed to fetch categories:', err)
    );
    dispatch(fetchColors()).catch((err) =>
      console.error('Failed to fetch colors:', err)
    );
    dispatch(fetchParts()).catch((err) =>
      console.error('Failed to fetch parts:', err)
    );
    dispatch(fetchEquipment()).catch((err) =>
      console.error('Failed to fetch equipment:', err)
    );
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Equipment',
      value: equipment.length,
      icon: '🔧',
      color: 'bg-blue-500',
      link: '/equipment',
    },
    {
      name: 'Total Parts',
      value: parts.length,
      icon: '⚙️',
      color: 'bg-green-500',
      link: '/parts',
    },
    {
      name: 'Total Brands',
      value: brands.length,
      icon: '🏷️',
      color: 'bg-purple-500',
      link: '/brands',
    },
    {
      name: 'Total Categories',
      value: categories.length,
      icon: '📂',
      color: 'bg-orange-500',
      link: '/categories',
    },
  ];

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600 mt-2'>
          Welcome to Rowen Inventory Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.link}>
            <div className='card hover:shadow-lg transition-shadow cursor-pointer'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.name}
                  </p>
                  <p className='text-3xl font-bold text-gray-900 mt-2'>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center text-3xl`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className='card mb-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Link to='/equipment' className='btn-primary text-center'>
            Manage Equipment
          </Link>
          <Link to='/parts' className='btn-primary text-center'>
            Manage Parts
          </Link>
          <Link to='/inventory' className='btn-primary text-center'>
            View Inventory
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='card'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Recent Items
        </h2>
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>
              Recent Brands
            </h3>
            <div className='flex flex-wrap gap-2'>
              {brands.slice(0, 5).map((brand) => (
                <span
                  key={brand.id}
                  className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                >
                  {brand.name}
                </span>
              ))}
              {brands.length === 0 && (
                <span className='text-gray-500 text-sm'>No brands yet</span>
              )}
            </div>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>
              Recent Categories
            </h3>
            <div className='flex flex-wrap gap-2'>
              {categories.slice(0, 5).map((category) => (
                <span
                  key={category.id}
                  className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'
                >
                  {category.name}
                </span>
              ))}
              {categories.length === 0 && (
                <span className='text-gray-500 text-sm'>No categories yet</span>
              )}
            </div>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>
              Recent Colors
            </h3>
            <div className='flex flex-wrap gap-2'>
              {colors.slice(0, 5).map((color) => (
                <span
                  key={color.id}
                  className='px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm'
                >
                  {color.name}
                </span>
              ))}
              {colors.length === 0 && (
                <span className='text-gray-500 text-sm'>No colors yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
