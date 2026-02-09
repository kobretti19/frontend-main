import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createEquipmentFromTemplate,
} from '../redux/slices/equipmentTemplatesSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import { fetchBrands, fetchCategories } from '../redux/slices/equipmentSlice';
import { equipmentTemplatesAPI } from '../api/api';
import {
  Modal,
  ConfirmDialog,
  LoadingSpinner,
  StatsCard,
  EmptyState,
  DatalistInput,
  PartSelector,
  PartsListTable,
} from '../components/Common';
import { useSearch } from '../context/SearchContext';

const EquipmentTemplates = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();

  // Redux state
  const { items: templates, loading } = useSelector(
    (state) => state.equipmentTemplates,
  );
  const { items: parts } = useSelector((state) => state.parts);
  const { brands, categories } = useSelector((state) => state.equipment);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateEquipmentModal, setShowCreateEquipmentModal] =
    useState(false);

  // State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [equipmentSerial, setEquipmentSerial] = useState('');
  const [isFetching, setIsFetching] = useState(false); // Loading state for getById

  // Form
  const initialFormData = {
    name: '',
    description: '',
    brand: '',
    category: '',
    parts_data: [],
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    dispatch(fetchTemplates());
    dispatch(fetchParts());
    dispatch(fetchBrands());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredTemplates = templates.filter((template) => {
    return (
      template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const resetForm = () => setFormData(initialFormData);

  // --- CHANGED: Handlers now fetch data by ID ---

  const openEditModal = async (template) => {
    setIsFetching(true);
    try {
      const response = await equipmentTemplatesAPI.getById(template.id);
      const fullData = response.data.data;

      // Safely handle parts_data if it comes back as a string from DB
      const parsedParts =
        typeof fullData.parts_data === 'string'
          ? JSON.parse(fullData.parts_data)
          : fullData.parts_data || [];

      setSelectedTemplate(fullData);
      setFormData({
        name: fullData.name || '',
        description: fullData.description || '',
        brand: fullData.brand || '',
        category: fullData.category || '',
        parts_data: parsedParts,
      });
      setShowEditModal(true);
    } catch (err) {
      alert('Error fetching template details: ' + err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const openDetailsModal = async (template) => {
    setIsFetching(true);
    try {
      const response = await equipmentTemplatesAPI.getById(template.id);
      const fullData = response.data.data;

      // Parse parts for the detail table
      if (typeof fullData.parts_data === 'string') {
        fullData.parts_data = JSON.parse(fullData.parts_data);
      }

      setSelectedTemplate(fullData);
      setShowDetailsModal(true);
    } catch (err) {
      alert('Error loading details: ' + err.message);
    } finally {
      setIsFetching(false);
    }
  };

  // --- Standard Logic ---

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.parts_data.length === 0) {
      alert('Please add at least one part');
      return;
    }
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
      await dispatch(
        updateTemplate({ id: selectedTemplate.id, data: formData }),
      ).unwrap();
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

  const handleCreateEquipment = async () => {
    try {
      await dispatch(
        createEquipmentFromTemplate({
          templateId: selectedTemplate.id,
          data: { serial_number: equipmentSerial },
        }),
      ).unwrap();
      alert('Equipment created successfully!');
      setShowCreateEquipmentModal(false);
      setEquipmentSerial('');
      setSelectedTemplate(null);
    } catch (err) {
      alert('Failed to create equipment: ' + err);
    }
  };

  const openCreateEquipmentModal = (template) => {
    setSelectedTemplate(template);
    setEquipmentSerial('');
    setShowCreateEquipmentModal(true);
  };

  const addPart = (part) => {
    setFormData({ ...formData, parts_data: [...formData.parts_data, part] });
  };

  const removePart = (index) => {
    setFormData({
      ...formData,
      parts_data: formData.parts_data.filter((_, i) => i !== index),
    });
  };

  const uniqueCategories = new Set(
    templates.filter((t) => t.category).map((t) => t.category),
  ).size;

  return (
    <div>
      {/* Global Fetching Overlay */}
      {isFetching && (
        <div className='fixed inset-0 bg-white/60 z-[9999] flex items-center justify-center'>
          <LoadingSpinner />
        </div>
      )}

      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Equipment Templates
          </h1>
          <p className='text-gray-600 mt-1'>
            Manage reusable equipment configurations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Create Template
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <StatsCard
          label='Total Templates'
          value={templates.length}
          color='gray'
        />
        <StatsCard
          label='Categories Used'
          value={uniqueCategories}
          color='blue'
        />
        <StatsCard
          label='Filtered Results'
          value={filteredTemplates.length}
          color='purple'
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          icon='📋'
          title='No Templates Yet'
          onAction={() => setShowCreateModal(true)}
          hasItems={templates.length > 0}
        />
      ) : (
        <div className='card overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Parts
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
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {template.category || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                      {template.parts_data?.length || 0} parts
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                    <button
                      onClick={() => openCreateEquipmentModal(template)}
                      className='text-green-600 hover:text-green-900'
                    >
                      🔧 Use
                    </button>
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

      {/* --- MODALS REMAIN LARGELY THE SAME BUT USE FETCHED SELECTEDTEMPLATE --- */}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title='Create Equipment Template'
        size='lg'
      >
        <form onSubmit={handleCreate} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Template Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='input-field'
                required
              />
            </div>
            <DatalistInput
              label='Category'
              value={formData.category}
              onChange={(v) => setFormData({ ...formData, category: v })}
              options={categories}
            />
            <DatalistInput
              label='Brand'
              value={formData.brand}
              onChange={(v) => setFormData({ ...formData, brand: v })}
              options={brands}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='input-field'
              rows='2'
            />
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-3'>
              Parts ({formData.parts_data.length})
            </h3>
            <PartSelector
              parts={parts}
              onAdd={addPart}
              existingParts={formData.parts_data}
            />
            <div className='mt-4'>
              <PartsListTable
                parts={formData.parts_data}
                onRemove={removePart}
              />
            </div>
          </div>
          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <button
              type='button'
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className='btn-secondary'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='btn-primary'
              disabled={formData.parts_data.length === 0}
            >
              Create Template
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title='Edit Template'
        size='lg'
      >
        <form onSubmit={handleEdit} className='space-y-4'>
          {/* ... Edit Form fields using formData ... */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Template Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='input-field'
                required
              />
            </div>
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-3'>
              Parts ({formData.parts_data.length})
            </h3>
            <PartSelector
              parts={parts}
              onAdd={addPart}
              existingParts={formData.parts_data}
            />
            <div className='mt-4'>
              <PartsListTable
                parts={formData.parts_data}
                onRemove={removePart}
              />
            </div>
          </div>
          <div className='flex justify-end space-x-3 pt-4 border-t'>
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
                <p className='text-sm text-gray-500'>Category</p>
                <p className='font-medium'>
                  {selectedTemplate.category || '-'}
                </p>
              </div>
            </div>
            <div>
              <p className='text-sm text-gray-500 mb-3'>Parts Configuration</p>
              <PartsListTable
                parts={selectedTemplate.parts_data || []}
                showRemove={false}
              />
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title='Delete Template'
        message={`Are you sure you want to delete "${selectedTemplate?.name}"?`}
      />

      <Modal
        isOpen={showCreateEquipmentModal}
        onClose={() => setShowCreateEquipmentModal(false)}
        title='Use Template'
        size='sm'
      >
        <div className='space-y-4'>
          <input
            type='text'
            value={equipmentSerial}
            onChange={(e) => setEquipmentSerial(e.target.value)}
            className='input-field'
            placeholder='Serial Number'
          />
          <button
            onClick={handleCreateEquipment}
            className='btn-primary w-full'
          >
            Create Equipment
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EquipmentTemplates;
