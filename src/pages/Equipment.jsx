import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../redux/slices/equipmentSlice';
import { fetchCategories } from '../redux/slices/categoriesSlice';
import { fetchBrands } from '../redux/slices/brandsSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import { fetchColors } from '../redux/slices/colorsSlice';
import { fetchPartsColors } from '../redux/slices/partsColorsSlice';
import {
  fetchTemplates,
  createTemplate,
  createTemplateFromEquipment,
  deleteTemplate,
} from '../redux/slices/equipmentTemplatesSlice';
import EquipmentTable from '../components/Tables/EquipmentTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

const Equipment = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();

  const equipment = useSelector((state) => state.equipment?.items || []);
  const loading = useSelector((state) => state.equipment?.loading || false);
  const categories = useSelector((state) => state.categories?.items || []);
  const brands = useSelector((state) => state.brands?.items || []);
  const parts = useSelector((state) => state.parts?.items || []);
  const colors = useSelector((state) => state.colors?.items || []);
  const partsColors = useSelector((state) => state.partsColors?.items || []);
  
  // Database templates from Redux
  const savedTemplates = useSelector((state) => state.equipmentTemplates?.items || []);
  const templatesLoading = useSelector((state) => state.equipmentTemplates?.loading || false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [formData, setFormData] = useState({
    model: '',
    category_id: '',
    brand_id: '',
    serial_number: '',
    year_manufactured: new Date().getFullYear(),
    production_date: '',
    status: 'active',
    parts: [],
  });
  const [currentPart, setCurrentPart] = useState({
    part_id: '',
    color_id: '',
    quantity: 1,
    notes: '',
  });

  const loadData = useCallback(() => {
    dispatch(fetchEquipment()).catch((err) =>
      console.error('Failed to fetch equipment:', err)
    );
  }, [dispatch]);

  useEffect(() => {
    loadData();
    dispatch(fetchCategories()).catch((err) =>
      console.error('Failed to fetch categories:', err)
    );
    dispatch(fetchBrands()).catch((err) =>
      console.error('Failed to fetch brands:', err)
    );
    dispatch(fetchParts()).catch((err) =>
      console.error('Failed to fetch parts:', err)
    );
    dispatch(fetchColors()).catch((err) =>
      console.error('Failed to fetch colors:', err)
    );
    dispatch(fetchPartsColors()).catch((err) =>
      console.error('Failed to fetch parts colors:', err)
    );
    dispatch(fetchTemplates()).catch((err) =>
      console.error('Failed to fetch templates:', err)
    );
  }, [dispatch, loadData]);

  // Save template from existing equipment to database
  const saveAsTemplate = async (item) => {
    setSelectedEquipment(item);
    setTemplateName(item.model || '');
    setShowSaveTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      await dispatch(createTemplateFromEquipment({
        equipment_id: selectedEquipment.id,
        template_name: templateName.trim(),
      })).unwrap();
      
      alert(`Template "${templateName}" saved successfully!`);
      setShowSaveTemplateModal(false);
      setTemplateName('');
      setSelectedEquipment(null);
    } catch (err) {
      alert('Failed to save template: ' + (err.message || err));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (formData.parts.length === 0) {
      alert('Please add at least one part to the equipment');
      return;
    }

    try {
      await dispatch(createEquipment(formData)).unwrap();

      // Ask to save as template
      if (window.confirm(`Save "${formData.model}" as a template for future use?`)) {
        try {
          await dispatch(createTemplate({
            name: formData.model,
            description: `Template for ${formData.model}`,
            category_id: formData.category_id || null,
            brand_id: formData.brand_id || null,
            parts_data: formData.parts,
          })).unwrap();
          alert('Template saved successfully!');
        } catch (err) {
          console.error('Failed to save template:', err);
          alert('Equipment created but failed to save template: ' + err);
        }
      }

      setShowCreateModal(false);
      setFormData({
        model: '',
        category_id: '',
        brand_id: '',
        serial_number: '',
        year_manufactured: new Date().getFullYear(),
        production_date: '',
        status: 'active',
        parts: [],
      });
      setCurrentPart({ part_id: '', color_id: '', quantity: 1, notes: '' });
      loadData();
    } catch (err) {
      console.error('Failed to create equipment:', err);
      alert(`Failed to create equipment: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await dispatch(updateEquipment({ id, data })).unwrap();
      loadData();
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Failed to update: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      await dispatch(deleteEquipment(id)).unwrap();
      loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleViewDetails = async (item) => {
    try {
      const { equipmentAPI } = await import('../api/api');
      const response = await equipmentAPI.getById(item.id);

      if (response.data.success && response.data.data) {
        setSelectedEquipment(response.data.data);
      } else {
        setSelectedEquipment(item);
      }
    } catch (err) {
      console.error('Failed to fetch equipment details:', err);
      setSelectedEquipment(item);
    }
    setShowDetailsModal(true);
  };

  const handleModelChange = (model) => {
    setFormData({ ...formData, model });

    // Check if template exists for this model in database
    const template = savedTemplates.find(t => t.name.toLowerCase() === model.toLowerCase());
    if (template && formData.parts.length === 0) {
      if (window.confirm(`Load saved parts from template "${template.name}"?`)) {
        setFormData({
          ...formData,
          model,
          category_id: template.category_id || formData.category_id,
          brand_id: template.brand_id || formData.brand_id,
          parts: template.parts_data || [],
        });
      }
    }
  };

  const addPartToList = () => {
    if (!currentPart.part_id) {
      alert('Please select a part');
      return;
    }

    if (!currentPart.color_id) {
      alert('Please select a color');
      return;
    }

    if (!currentPart.quantity || currentPart.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const part = parts.find((p) => p.id === parseInt(currentPart.part_id));
    const color = colors.find((c) => c.id === parseInt(currentPart.color_id));

    const partColor = partsColors.find(
      (pc) =>
        pc.part_id === parseInt(currentPart.part_id) &&
        pc.color_id === parseInt(currentPart.color_id)
    );

    if (!partColor) {
      alert(
        `Part "${part?.name}" with color "${color?.name}" is not available in inventory. Please add it to Parts Colors first.`
      );
      return;
    }

    if (partColor.quantity < parseInt(currentPart.quantity)) {
      alert(
        `Insufficient stock! Available: ${partColor.quantity}, Needed: ${currentPart.quantity}`
      );
      return;
    }

    const exists = formData.parts.find(
      (p) =>
        p.part_id === parseInt(currentPart.part_id) &&
        p.color_id === parseInt(currentPart.color_id)
    );

    if (exists) {
      alert('This part-color combination is already added');
      return;
    }

    const newPart = {
      part_id: parseInt(currentPart.part_id),
      color_id: parseInt(currentPart.color_id),
      quantity: parseInt(currentPart.quantity),
      notes: currentPart.notes,
      part_name: part?.name,
      color_name: color?.name,
    };

    setFormData({
      ...formData,
      parts: [...formData.parts, newPart],
    });

    setCurrentPart({ part_id: '', color_id: '', quantity: 1, notes: '' });
  };

  const removePartFromList = (index) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_, i) => i !== index),
    });
  };

  const loadTemplate = (template) => {
    setFormData({
      ...formData,
      model: template.name,
      category_id: template.category_id || '',
      brand_id: template.brand_id || '',
      parts: template.parts_data || [],
    });
    setShowTemplateModal(false);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (template) => {
    if (window.confirm(`Delete template "${template.name}"?`)) {
      try {
        await dispatch(deleteTemplate(template.id)).unwrap();
      } catch (err) {
        alert('Failed to delete template: ' + err);
      }
    }
  };

  // Helper function to get week number of a date
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  };

  // Calculate date values first
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentWeekNumber = getWeekNumber(currentDate);

  // Filter equipment
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const itemDate = new Date(item.created_at);

    if (filterYear) {
      const itemYear = itemDate.getFullYear().toString();
      if (itemYear !== filterYear) return false;
    }

    if (filterMonth) {
      const itemMonth = (itemDate.getMonth() + 1).toString();
      if (itemMonth !== filterMonth) return false;
    }

    if (filterWeek) {
      if (filterWeek === 'current') {
        const itemWeek = getWeekNumber(itemDate);
        const itemYear = itemDate.getFullYear();
        if (itemWeek !== currentWeekNumber || itemYear !== currentYear)
          return false;
      } else if (filterWeek === 'last') {
        const lastWeek = currentWeekNumber === 1 ? 52 : currentWeekNumber - 1;
        const itemWeek = getWeekNumber(itemDate);
        const itemYear = itemDate.getFullYear();
        const expectedYear =
          currentWeekNumber === 1 ? currentYear - 1 : currentYear;
        if (itemWeek !== lastWeek || itemYear !== expectedYear) return false;
      } else {
        const itemWeek = getWeekNumber(itemDate);
        if (itemWeek.toString() !== filterWeek) return false;
      }
    }

    return true;
  });

  // Calculate stats
  const createdThisMonth = equipment.filter((item) => {
    const itemDate = new Date(item.created_at);
    return (
      itemDate.getMonth() === currentMonth &&
      itemDate.getFullYear() === currentYear
    );
  }).length;

  const createdThisYear = equipment.filter((item) => {
    const itemDate = new Date(item.created_at);
    return itemDate.getFullYear() === currentYear;
  }).length;

  const createdThisWeek = equipment.filter((item) => {
    const itemDate = new Date(item.created_at);
    return (
      getWeekNumber(itemDate) === currentWeekNumber &&
      itemDate.getFullYear() === currentYear
    );
  }).length;

  // Get unique years from equipment
  const availableYears = [
    ...new Set(
      equipment.map((item) => new Date(item.created_at).getFullYear())
    ),
  ].sort((a, b) => b - a);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Equipment</h1>
          <p className='text-gray-600 mt-1'>Manage your equipment inventory</p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={() => setShowTemplateModal(true)}
            className='btn-secondary'
          >
            📋 Templates ({savedTemplates.length})
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary'
          >
            + Create Equipment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Equipment</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>
            {equipment.length}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Created This Week</p>
          <p className='text-3xl font-bold text-orange-600 mt-2'>
            {createdThisWeek}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Created This Month</p>
          <p className='text-3xl font-bold text-green-600 mt-2'>
            {createdThisMonth}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Created This Year</p>
          <p className='text-3xl font-bold text-blue-600 mt-2'>
            {createdThisYear}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Filtered Results</p>
          <p className='text-3xl font-bold text-purple-600 mt-2'>
            {filteredEquipment.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='card mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4'>
          <div className='flex-1'>
            {searchTerm && (
              <p className='text-sm text-gray-600'>
                Searching for:{' '}
                <span className='font-medium text-gray-900'>"{searchTerm}"</span>
              </p>
            )}
          </div>

          <div className='flex items-center space-x-3'>
            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className='input-field'
            >
              <option value=''>All Weeks</option>
              <option value='current'>This Week</option>
              <option value='last'>Last Week</option>
              {[...Array(52)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className='input-field'
            >
              <option value=''>All Months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className='input-field'
            >
              <option value=''>All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {(filterYear || filterMonth || filterWeek) && (
              <button
                onClick={() => {
                  setFilterYear('');
                  setFilterMonth('');
                  setFilterWeek('');
                }}
                className='btn-secondary whitespace-nowrap'
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredEquipment.length === 0 ? (
        <div className='card text-center py-12'>
          <div className='text-6xl mb-4'>🔧</div>
          <p className='text-xl font-semibold text-gray-900 mb-2'>
            {equipment.length === 0 ? 'No Equipment Yet' : 'No Results Found'}
          </p>
          <p className='text-gray-500 mb-6'>
            {equipment.length === 0
              ? 'Create your first equipment by adding parts and colors'
              : 'Try adjusting your search or filters'}
          </p>
          {equipment.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className='btn-primary'
            >
              + Create Equipment
            </button>
          )}
        </div>
      ) : (
        <EquipmentTable
          equipment={filteredEquipment}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onSaveAsTemplate={saveAsTemplate}
        />
      )}

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title='Equipment Templates'
        size='lg'
      >
        <div className='space-y-3'>
          <p className='text-sm text-gray-600 mb-4'>
            Templates save parts configurations for quick reuse. Use "Save as Template" from existing equipment to create templates.
          </p>
          
          {templatesLoading ? (
            <div className='text-center py-8'>
              <LoadingSpinner />
            </div>
          ) : savedTemplates.length === 0 ? (
            <div className='text-center py-8 bg-gray-50 rounded-lg'>
              <div className='text-4xl mb-3'>📋</div>
              <p className='text-gray-500'>
                No templates saved yet. Create equipment and use "Save as Template" button.
              </p>
            </div>
          ) : (
            <div className='space-y-2 max-h-96 overflow-y-auto'>
              {savedTemplates.map((template) => (
                <div
                  key={template.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                >
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900'>{template.name}</p>
                    <p className='text-sm text-gray-500'>
                      {template.parts_data?.length || 0} parts
                      {template.category_name && ` • ${template.category_name}`}
                      {template.brand_name && ` • ${template.brand_name}`}
                    </p>
                    {template.description && (
                      <p className='text-xs text-gray-400 mt-1'>{template.description}</p>
                    )}
                  </div>
                  <div className='flex space-x-2 ml-4'>
                    <button
                      onClick={() => loadTemplate(template)}
                      className='px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium'
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className='px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Save Template Modal */}
      <Modal
        isOpen={showSaveTemplateModal}
        onClose={() => {
          setShowSaveTemplateModal(false);
          setTemplateName('');
        }}
        title='Save as Template'
        size='sm'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Save this equipment configuration as a reusable template.
          </p>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Template Name *
            </label>
            <input
              type='text'
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className='input-field'
              placeholder='Enter template name'
              autoFocus
            />
          </div>
          <div className='flex justify-end space-x-3 pt-4'>
            <button
              onClick={() => {
                setShowSaveTemplateModal(false);
                setTemplateName('');
              }}
              className='btn-secondary'
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTemplate}
              className='btn-primary'
              disabled={!templateName.trim()}
            >
              Save Template
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Equipment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCurrentPart({ part_id: '', color_id: '', quantity: 1, notes: '' });
        }}
        title='Create New Equipment'
        size='lg'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-6'>
            {/* Basic Information */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Basic Information
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Model Name *
                  </label>
                  <input
                    type='text'
                    value={formData.model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className='input-field'
                    placeholder='e.g., Absolute Two Silver'
                    required
                  />
                  {savedTemplates.find(t => t.name.toLowerCase() === formData.model.toLowerCase()) && (
                    <p className='text-sm text-green-600 mt-1'>
                      ✓ Template available
                    </p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Serial Number (Optional)
                  </label>
                  <input
                    type='text'
                    value={formData.serial_number}
                    onChange={(e) =>
                      setFormData({ ...formData, serial_number: e.target.value })
                    }
                    className='input-field'
                    placeholder='e.g., ABS-2024-001'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
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
                    Brand
                  </label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_id: e.target.value })
                    }
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
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Year Manufactured
                  </label>
                  <input
                    type='number'
                    value={formData.year_manufactured}
                    onChange={(e) =>
                      setFormData({ ...formData, year_manufactured: e.target.value })
                    }
                    className='input-field'
                    min='1900'
                    max='2100'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Production Date
                  </label>
                  <input
                    type='date'
                    value={formData.production_date}
                    onChange={(e) =>
                      setFormData({ ...formData, production_date: e.target.value })
                    }
                    className='input-field'
                  />
                </div>
              </div>
            </div>

            {/* Parts Section */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Add Parts *{' '}
                <span className='text-sm text-gray-500 font-normal'>
                  ({formData.parts.length} added)
                </span>
              </h3>
              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                <div className='grid grid-cols-4 gap-3 mb-3'>
                  <select
                    value={currentPart.part_id}
                    onChange={(e) => {
                      setCurrentPart({
                        ...currentPart,
                        part_id: e.target.value,
                        color_id: '',
                      });
                    }}
                    className='input-field'
                  >
                    <option value=''>Select part</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentPart.color_id}
                    onChange={(e) => {
                      setCurrentPart({ ...currentPart, color_id: e.target.value });
                    }}
                    className='input-field'
                    disabled={!currentPart.part_id}
                  >
                    <option value=''>
                      {!currentPart.part_id ? 'Select part first' : 'Select color'}
                    </option>
                    {currentPart.part_id &&
                      colors.map((color) => {
                        const partColor = partsColors.find(
                          (pc) =>
                            pc.part_id === parseInt(currentPart.part_id) &&
                            pc.color_id === color.id
                        );
                        const available = partColor ? partColor.quantity : 0;
                        const isAvailable = partColor && partColor.quantity > 0;

                        return (
                          <option
                            key={color.id}
                            value={color.id}
                            disabled={!isAvailable}
                          >
                            {color.name}{' '}
                            {isAvailable ? `(${available} available)` : '(Not in stock)'}
                          </option>
                        );
                      })}
                  </select>

                  <input
                    type='number'
                    value={currentPart.quantity}
                    onChange={(e) =>
                      setCurrentPart({ ...currentPart, quantity: e.target.value })
                    }
                    className='input-field'
                    placeholder='Qty'
                    min='1'
                  />

                  <button type='button' onClick={addPartToList} className='btn-success'>
                    Add
                  </button>
                </div>
                <input
                  type='text'
                  value={currentPart.notes}
                  onChange={(e) =>
                    setCurrentPart({ ...currentPart, notes: e.target.value })
                  }
                  className='input-field'
                  placeholder='Notes (optional)'
                />
              </div>

              {formData.parts.length > 0 ? (
                <div className='border rounded-lg overflow-hidden'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Part
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Color
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Qty
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Notes
                        </th>
                        <th className='px-4 py-2 text-right text-xs font-medium text-gray-500'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {formData.parts.map((part, index) => (
                        <tr key={index}>
                          <td className='px-4 py-2 text-sm'>{part.part_name}</td>
                          <td className='px-4 py-2 text-sm'>{part.color_name}</td>
                          <td className='px-4 py-2 text-sm'>{part.quantity}</td>
                          <td className='px-4 py-2 text-sm text-gray-500'>
                            {part.notes || '-'}
                          </td>
                          <td className='px-4 py-2 text-sm text-right'>
                            <button
                              type='button'
                              onClick={() => removePartFromList(index)}
                              className='text-red-600 hover:text-red-900'
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                  <p className='text-gray-500'>
                    No parts added yet. Add parts above to continue.
                  </p>
                </div>
              )}
            </div>

            <div className='flex justify-end space-x-3 pt-4 border-t'>
              <button
                type='button'
                onClick={() => {
                  setShowCreateModal(false);
                  setCurrentPart({ part_id: '', color_id: '', quantity: 1, notes: '' });
                }}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='btn-primary'
                disabled={formData.parts.length === 0}
              >
                Create Equipment ({formData.parts.length} parts)
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Equipment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title='Equipment Details'
        size='lg'
      >
        {selectedEquipment && (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600'>Model</p>
                <p className='text-lg font-semibold'>{selectedEquipment.model}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Serial Number</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.serial_number || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Category</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.category_name || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Brand</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.brand_name || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Year Manufactured</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.year_manufactured || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Created By</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.created_by_name ||
                    selectedEquipment.created_by_username ||
                    '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Date Created</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.created_at
                    ? new Date(selectedEquipment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            {selectedEquipment.parts_used && (
              <div>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='text-lg font-semibold'>Parts Used</h3>
                  <button
                    type='button'
                    onClick={() => {
                      setShowDetailsModal(false);
                      saveAsTemplate(selectedEquipment);
                    }}
                    className='btn-secondary text-sm'
                  >
                    💾 Save as Template
                  </button>
                </div>
                <div className='border rounded-lg overflow-hidden'>
                  <table className='min-w-full'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Part
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Color
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Quantity
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y'>
                      {(typeof selectedEquipment.parts_used === 'string'
                        ? JSON.parse(selectedEquipment.parts_used)
                        : selectedEquipment.parts_used
                      )
                        .filter((part) => part && part.part_name)
                        .map((part, index) => (
                          <tr key={index}>
                            <td className='px-4 py-2 text-sm'>{part.part_name}</td>
                            <td className='px-4 py-2 text-sm'>{part.color_name}</td>
                            <td className='px-4 py-2 text-sm'>
                              {part.quantity_needed || part.quantity}
                            </td>
                            <td className='px-4 py-2 text-sm text-gray-500'>
                              {part.notes || '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Equipment;
