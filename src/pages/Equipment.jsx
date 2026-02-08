import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEquipment,
  fetchBrands,
  fetchCategories,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../redux/slices/equipmentSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import {
  fetchTemplates,
  createTemplateFromEquipment,
  deleteTemplate,
} from '../redux/slices/equipmentTemplatesSlice';
import EquipmentTable from '../components/Tables/EquipmentTable';
import {
  Modal,
  LoadingSpinner,
  PartSelector,
  PartsListTable,
  TemplateSelector,
  StatsCard,
  EmptyState,
  DatalistInput,
} from '../components/Common';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const Equipment = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();
  const navigate = useNavigate();

  // Redux state
  const {
    items: equipment,
    brands,
    categories,
    loading,
  } = useSelector((state) => state.equipment);
  const { items: parts } = useSelector((state) => state.parts);
  const { items: templates, loading: templatesLoading } = useSelector(
    (state) => state.equipmentTemplates,
  );

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // State
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Filters
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterWeek, setFilterWeek] = useState('');

  // Form
  const initialFormData = {
    model: '',
    brand: '',
    category: '',
    serial_number: '',
    article_id: '',
    year_manufactured: new Date().getFullYear(),
    production_date: '',
    status: 'active',
    template_id: '',
    parts: [],
  };
  const [formData, setFormData] = useState(initialFormData);

  // Load data
  const loadData = useCallback(() => {
    dispatch(fetchEquipment());
  }, [dispatch]);

  useEffect(() => {
    loadData();
    dispatch(fetchBrands());
    dispatch(fetchCategories());
    dispatch(fetchParts());
    dispatch(fetchTemplates());
  }, [dispatch, loadData]);

  // Helpers
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentWeekNumber = getWeekNumber(currentDate);

  // Filter logic
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const itemDate = new Date(item.created_at);
    if (filterYear && itemDate.getFullYear().toString() !== filterYear)
      return false;
    if (filterMonth && (itemDate.getMonth() + 1).toString() !== filterMonth)
      return false;

    if (filterWeek) {
      const itemWeek = getWeekNumber(itemDate);
      if (
        filterWeek === 'current' &&
        (itemWeek !== currentWeekNumber ||
          itemDate.getFullYear() !== currentYear)
      )
        return false;
      if (filterWeek === 'last') {
        const lastWeek = currentWeekNumber === 1 ? 52 : currentWeekNumber - 1;
        if (itemWeek !== lastWeek) return false;
      }
      if (
        !['current', 'last'].includes(filterWeek) &&
        itemWeek.toString() !== filterWeek
      )
        return false;
    }

    return true;
  });

  // Stats
  const stats = {
    total: equipment.length,
    thisWeek: equipment.filter((i) => {
      const d = new Date(i.created_at);
      return (
        getWeekNumber(d) === currentWeekNumber &&
        d.getFullYear() === currentYear
      );
    }).length,
    thisMonth: equipment.filter((i) => {
      const d = new Date(i.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length,
    thisYear: equipment.filter(
      (i) => new Date(i.created_at).getFullYear() === currentYear,
    ).length,
    filtered: filteredEquipment.length,
  };

  // Handlers
  const resetForm = () => {
    setFormData(initialFormData);
    setSaveAsTemplate(false);
  };

  const handleTemplateSelect = (templateId) => {
    if (templateId) {
      const template = templates.find((t) => t.id === parseInt(templateId));
      if (template) {
        setFormData({
          ...formData,
          template_id: templateId,
          model: template.name,
          brand: template.brand || '',
          category: template.category || '',
          parts: [],
        });
      }
    } else {
      setFormData({ ...formData, template_id: '', parts: [] });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.template_id && formData.parts.length === 0) {
      alert('Please select a template or add at least one part');
      return;
    }

    try {
      const payload = {
        model: formData.model,
        serial_number: formData.serial_number || null,
        brand: formData.brand || null,
        category: formData.category || null,
        article_id: formData.article_id || null,
        template_id: formData.template_id || null,
        production_date: formData.production_date || null,
        year_manufactured: formData.year_manufactured || null,
        parts: formData.parts.map((p) => ({
          part_id: p.part_id,
          quantity_needed: p.quantity_needed,
          notes: p.notes || '',
          part_name: p.part_name,
          part_color: p.part_color,
          part_sku: p.part_sku,
        })),
        save_as_template: saveAsTemplate,
        template_name: saveAsTemplate ? formData.model : null,
      };

      console.log('Creating equipment with payload:', payload); // Debug

      await dispatch(createEquipment(payload)).unwrap();

      setShowCreateModal(false);
      resetForm();
      loadData();
      if (saveAsTemplate) dispatch(fetchTemplates());
    } catch (err) {
      alert(`Failed to create equipment: ${err.message || err}`);
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await dispatch(updateEquipment({ id, data })).unwrap();
      loadData();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?'))
      return;
    try {
      await dispatch(deleteEquipment(id)).unwrap();
      loadData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleViewDetails = async (item) => {
    try {
      const { equipmentAPI } = await import('../api/api');
      const response = await equipmentAPI.getById(item.id);
      setSelectedEquipment(response.data.success ? response.data.data : item);
    } catch {
      setSelectedEquipment(item);
    }
    setShowDetailsModal(true);
  };

  const handleSaveAsTemplate = (item) => {
    setSelectedEquipment(item);
    setTemplateName(item.model || '');
    setShowSaveTemplateModal(true);
  };

  const confirmSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    try {
      await dispatch(
        createTemplateFromEquipment({
          equipment_id: selectedEquipment.id,
          name: templateName.trim(),
        }),
      ).unwrap();
      alert(`Template "${templateName}" saved!`);
      setShowSaveTemplateModal(false);
      setTemplateName('');
    } catch (err) {
      alert('Failed to save template: ' + err);
    }
  };

  console.log(selectedEquipment, 'selectedEquipment');
  const handleDeleteTemplate = async (template) => {
    if (window.confirm(`Delete template "${template.name}"?`)) {
      try {
        await dispatch(deleteTemplate(template.id)).unwrap();
      } catch (err) {
        alert('Failed to delete template: ' + err);
      }
    }
  };

  const addPart = (part) => {
    setFormData({ ...formData, parts: [...formData.parts, part] });
  };

  const removePart = (index) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_, i) => i !== index),
    });
  };

  // Filter options
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

  const availableYears = [
    ...new Set(equipment.map((i) => new Date(i.created_at).getFullYear())),
  ].sort((a, b) => b - a);

  const weekOptions = [
    { value: 'current', label: 'This Week' },
    { value: 'last', label: 'Last Week' },
    ...[...Array(52)].map((_, i) => ({
      value: (i + 1).toString(),
      label: `Week ${i + 1}`,
    })),
  ];

  return (
    <div>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Equipment</h1>
          <p className='text-gray-600 mt-1'>Manage your equipment inventory</p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={() => navigate('/equipment/report')}
            className='btn-secondary'
          >
            📊 Report
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            className='btn-secondary'
          >
            📋 Templates ({templates.length})
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary'
          >
            + Create Equipment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-6'>
        <StatsCard label='Total Equipment' value={stats.total} color='gray' />
        <StatsCard
          label='Created This Week'
          value={stats.thisWeek}
          color='orange'
        />
        <StatsCard
          label='Created This Month'
          value={stats.thisMonth}
          color='green'
        />
        <StatsCard
          label='Created This Year'
          value={stats.thisYear}
          color='blue'
        />
        <StatsCard
          label='Filtered Results'
          value={stats.filtered}
          color='purple'
        />
      </div>

      {/* Filters */}
      <div className='card mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4'>
          <div className='flex-1'>
            {searchTerm && (
              <p className='text-sm text-gray-600'>
                Searching for:{' '}
                <span className='font-medium'>"{searchTerm}"</span>
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
              {weekOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className='input-field'
            >
              <option value=''>All Months</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className='input-field'
            >
              <option value=''>All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
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
                className='btn-secondary'
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredEquipment.length === 0 ? (
        <EmptyState
          icon='🔧'
          title='No Equipment Yet'
          message='Create your first equipment'
          actionLabel='+ Create Equipment'
          onAction={() => setShowCreateModal(true)}
          hasItems={equipment.length > 0}
        />
      ) : (
        <EquipmentTable
          equipment={filteredEquipment}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onSaveAsTemplate={handleSaveAsTemplate}
        />
      )}

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title='Equipment Templates'
        size='lg'
      >
        {templatesLoading ? (
          <LoadingSpinner />
        ) : templates.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <div className='text-4xl mb-3'>📋</div>
            <p className='text-gray-500'>No templates saved yet.</p>
          </div>
        ) : (
          <div className='space-y-2 max-h-96 overflow-y-auto'>
            {templates.map((t) => (
              <div
                key={t.id}
                className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
              >
                <div>
                  <p className='font-medium'>{t.name}</p>
                  <p className='text-sm text-gray-500'>
                    {t.parts_data?.length || 0} parts{' '}
                    {t.brand && `• ${t.brand}`}
                  </p>
                </div>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => {
                      handleTemplateSelect(t.id.toString());
                      setShowTemplateModal(false);
                      setShowCreateModal(true);
                    }}
                    className='px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm'
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(t)}
                    className='px-3 py-1 bg-red-100 text-red-700 rounded text-sm'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Save Template Modal */}
      <Modal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        title='Save as Template'
        size='sm'
      >
        <div className='space-y-4'>
          <input
            type='text'
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className='input-field'
            placeholder='Template name'
          />
          <div className='flex justify-end space-x-3'>
            <button
              onClick={() => setShowSaveTemplateModal(false)}
              className='btn-secondary'
            >
              Cancel
            </button>
            <button
              onClick={confirmSaveTemplate}
              className='btn-primary'
              disabled={!templateName.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title='Create Equipment'
        size='lg'
      >
        <form onSubmit={handleCreate} className='space-y-6'>
          {/* Template Selector */}
          <TemplateSelector
            templates={templates}
            value={formData.template_id}
            onChange={handleTemplateSelect}
          />

          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Model *
              </label>
              <input
                type='text'
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className='input-field'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Serial Number
              </label>
              <input
                type='text'
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
                className='input-field'
              />
            </div>
            <DatalistInput
              label='Brand'
              value={formData.brand}
              onChange={(v) => setFormData({ ...formData, brand: v })}
              options={brands}
            />
            <DatalistInput
              label='Category'
              value={formData.category}
              onChange={(v) => setFormData({ ...formData, category: v })}
              options={categories}
            />
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Article ID
              </label>
              <input
                type='text'
                value={formData.article_id}
                onChange={(e) =>
                  setFormData({ ...formData, article_id: e.target.value })
                }
                className='input-field'
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

          {/* Parts (only if no template) */}
          {!formData.template_id && (
            <div>
              <h3 className='text-lg font-semibold mb-4'>
                Parts ({formData.parts.length})
              </h3>
              <PartSelector
                parts={parts}
                onAdd={addPart}
                existingParts={formData.parts}
              />
              <div className='mt-4'>
                <PartsListTable parts={formData.parts} onRemove={removePart} />
              </div>
            </div>
          )}

          {/* Save as Template Checkbox */}
          {!formData.template_id && formData.parts.length > 0 && (
            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className='h-4 w-4 text-blue-600 rounded'
              />
              <span className='text-sm text-gray-700'>Save as template</span>
            </label>
          )}

          {/* Buttons */}
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
              disabled={!formData.template_id && formData.parts.length === 0}
            >
              {formData.template_id
                ? 'Create from Template'
                : `Create (${formData.parts.length} parts)`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
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
                <p className='text-lg font-semibold'>
                  {selectedEquipment.model}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Serial</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.serial_number || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Brand</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.brand || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Category</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.category || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Template</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.template_name || '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Created</p>
                <p className='text-lg font-semibold'>
                  {selectedEquipment.created_at
                    ? new Date(
                        selectedEquipment.created_at,
                      ).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>

            {selectedEquipment.parts?.length > 0 && (
              <div>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='text-lg font-semibold'>Parts Used</h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleSaveAsTemplate(selectedEquipment);
                    }}
                    className='btn-secondary text-sm'
                  >
                    💾 Save as Template
                  </button>
                </div>
                <PartsListTable
                  parts={selectedEquipment.parts}
                  showRemove={false}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Equipment;
