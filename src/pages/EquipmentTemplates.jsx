import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../redux/slices/equipmentTemplatesSlice';
import { fetchCategories } from '../redux/slices/categoriesSlice';
import { fetchBrands } from '../redux/slices/brandsSlice';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

const EquipmentTemplates = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();

  const templates = useSelector((state) => state.equipmentTemplates?.items || []);
  const loading = useSelector((state) => state.equipmentTemplates?.loading || false);
  const categories = useSelector((state) => state.categories?.items || []);
  const brands = useSelector((state) => state.brands?.items || []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    parts_data: [],
  });

  useEffect(() => {
    dispatch(fetchTemplates());
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    return (
      template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTemplate(formData)).unwrap();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      alert('Failed to create template: ' + err);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateTemplate({ id: selectedTemplate.id, data: formData })).unwrap();
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
    } catch (err) {
      alert('Failed to update template: ' + err);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteTemplate(selectedTemplate.id)).unwrap();
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
    } catch (err) {
      alert('Failed to delete template: ' + err);
    }
  };

  const openEditModal = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name || '',
      description: template.description || '',
      category_id: template.category_id || '',
      brand_id: template.brand_id || '',
      parts_data: template.parts_data || [],
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (template) => {
    setSelectedTemplate(template);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      brand_id: '',
      parts_data: [],
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Equipment Templates</h1>
          <p className='text-gray-600 mt-1'>Manage reusable equipment configurations</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className='btn-primary'>
          + Create Template
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Templates</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>{templates.length}</p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Categories Used</p>
          <p className='text-3xl font-bold text-blue-600 mt-2'>
            {new Set(templates.filter(t => t.category_id).map(t => t.category_id)).size}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Filtered Results</p>
          <p className='text-3xl font-bold text-purple-600 mt-2'>{filteredTemplates.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='card mb-6'>
        <div className='flex items-center'>
          {searchTerm && (
            <p className='text-sm text-gray-600'>
              Searching for: <span className='font-medium text-gray-900'>"{searchTerm}"</span>
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredTemplates.length === 0 ? (
        <div className='card text-center py-12'>
          <div className='text-6xl mb-4'>📋</div>
          <p className='text-xl font-semibold text-gray-900 mb-2'>
            {templates.length === 0 ? 'No Templates Yet' : 'No Results Found'}
          </p>
          <p className='text-gray-500 mb-6'>
            {templates.length === 0
              ? 'Create templates to quickly build new equipment with predefined parts'
              : 'Try adjusting your search'}
          </p>
          {templates.length === 0 && (
            <button onClick={() => setShowCreateModal(true)} className='btn-primary'>
              + Create Template
            </button>
          )}
        </div>
      ) : (
        <div className='card overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Description
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Brand
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Parts
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Created
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredTemplates.map((template) => (
                <tr key={template.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {template.name}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-500 max-w-xs truncate'>
                    {template.description || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {template.category_name || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {template.brand_name || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                      {template.parts_data?.length || 0} parts
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(template.created_at)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                    <button
                      onClick={() => openDetailsModal(template)}
                      className='text-gray-600 hover:text-gray-900'
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className='text-blue-600 hover:text-blue-900'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowDeleteDialog(true);
                      }}
                      className='text-red-600 hover:text-red-900'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create Equipment Template'
        size='md'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Template Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='input-field'
                placeholder='e.g., Standard Amplifier Setup'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='input-field'
                rows='3'
                placeholder='Describe this template...'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Default Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className='input-field'
                >
                  <option value=''>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Default Brand
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className='input-field'
                >
                  <option value=''>Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='bg-yellow-50 p-4 rounded-lg'>
              <p className='text-sm text-yellow-800'>
                <strong>Tip:</strong> To create a template with parts, first create equipment with the desired parts configuration, then use the "Save as Template" button on the Equipment page.
              </p>
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowCreateModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Create Template
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Template'
        size='md'
      >
        <form onSubmit={handleEdit}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Template Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='input-field'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='input-field'
                rows='3'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Default Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className='input-field'
                >
                  <option value=''>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Default Brand
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className='input-field'
                >
                  <option value=''>Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowEditModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title='Template Details'
        size='lg'
      >
        {selectedTemplate && (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Template Name</p>
                <p className='font-medium'>{selectedTemplate.name}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Created By</p>
                <p className='font-medium'>{selectedTemplate.created_by_username || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Category</p>
                <p className='font-medium'>{selectedTemplate.category_name || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Brand</p>
                <p className='font-medium'>{selectedTemplate.brand_name || '-'}</p>
              </div>
            </div>

            {selectedTemplate.description && (
              <div>
                <p className='text-sm text-gray-500'>Description</p>
                <p className='font-medium'>{selectedTemplate.description}</p>
              </div>
            )}

            <div>
              <p className='text-sm text-gray-500 mb-3'>Parts Configuration</p>
              {selectedTemplate.parts_data?.length > 0 ? (
                <div className='bg-gray-50 rounded-lg overflow-hidden'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-100'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                          Part
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                          Color
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                          Quantity
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {selectedTemplate.parts_data.map((part, index) => (
                        <tr key={index}>
                          <td className='px-4 py-2 text-sm font-medium text-gray-900'>
                            {part.part_name}
                          </td>
                          <td className='px-4 py-2 text-sm text-gray-500'>
                            {part.color_name}
                          </td>
                          <td className='px-4 py-2 text-sm text-gray-500'>
                            {part.quantity}
                          </td>
                          <td className='px-4 py-2 text-sm text-gray-500'>
                            {part.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-gray-500 italic'>No parts configured</p>
              )}
            </div>

            <div className='flex justify-end'>
              <button
                onClick={() => setShowDetailsModal(false)}
                className='btn-secondary'
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title='Delete Template'
        message={`Are you sure you want to delete "${selectedTemplate?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default EquipmentTemplates;
