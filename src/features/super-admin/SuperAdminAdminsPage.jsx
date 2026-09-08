import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil } from 'lucide-react'
import { adminsApi, createAdminAccount } from '../../lib/mockApi'
import { Table, TableHead, TableBody, Th, Td, Tr } from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/dashboard/PageHeader'

const emptyForm = { name: '', phone: '' }

const ADMIN_STATUS_LABELS = {
  active: 'superAdminAdmins.statusActive',
  inactive: 'superAdminAdmins.statusInactive',
}

export default function SuperAdminAdminsPage() {
  const { t } = useTranslation()
  const [admins, setAdmins] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [confirmAdmin, setConfirmAdmin] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(false)

  async function load() {
    setAdmins(await adminsApi.list())
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setOpen(true)
  }

  function openEdit(a) {
    setForm({ name: a.name, phone: a.phone })
    setEditingId(a.id)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    if (editingId) {
      await adminsApi.update(editingId, { name: form.name, phone: form.phone })
    } else {
      await createAdminAccount({ name: form.name, phone: form.phone })
    }
    setSaving(false)
    closeModal()
    load()
  }

  async function confirmToggleStatus() {
    setTogglingStatus(true)
    await adminsApi.update(confirmAdmin.id, { status: confirmAdmin.status === 'active' ? 'inactive' : 'active' })
    setTogglingStatus(false)
    setConfirmAdmin(null)
    load()
  }

  if (!admins) return null

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader title={t('superAdminAdmins.title')} subtitle={t('superAdminAdmins.subtitle')} />
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus size={17} />
          {t('superAdminAdmins.createAdmin')}
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead>
            <Th>{t('superAdminAdmins.tableName')}</Th>
            <Th>{t('superAdminAdmins.tablePhone')}</Th>
            <Th>{t('superAdminAdmins.tableRole')}</Th>
            <Th>{t('superAdminAdmins.colStatus')}</Th>
            <Th>{t('superAdminAdmins.colActions')}</Th>
          </TableHead>
          <TableBody>
            {admins.map((a) => (
              <Tr key={a.id}>
                <Td className="font-medium text-slate-800">{a.name}</Td>
                <Td>{a.phone}</Td>
                <Td>
                  <Badge tone={a.role === 'super-admin' ? 'brand' : 'neutral'}>
                    {a.role === 'super-admin' ? t('superAdminAdmins.roleSuperAdmin') : t('superAdminAdmins.roleAdmin')}
                  </Badge>
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => setConfirmAdmin(a)}
                    className="cursor-pointer"
                    aria-label={t('superAdminAdmins.toggleStatus')}
                  >
                    <Badge tone={(a.status ?? 'active') === 'active' ? 'success' : 'neutral'}>
                      {t(ADMIN_STATUS_LABELS[a.status ?? 'active'])}
                    </Badge>
                  </button>
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-900/[0.04] hover:text-brand-700"
                    aria-label={t('superAdminAdmins.edit')}
                  >
                    <Pencil size={15} />
                  </button>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal open={open} onClose={closeModal} title={editingId ? t('superAdminAdmins.editModalTitle') : t('superAdminAdmins.modalTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('superAdminAdmins.fullName')}
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label={t('superAdminAdmins.phoneNumber')}
            required
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving
              ? (editingId ? t('superAdminAdmins.saving') : t('superAdminAdmins.creating'))
              : (editingId ? t('superAdminAdmins.saveChanges') : t('superAdminAdmins.submitButton'))}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmAdmin}
        title={t('superAdminAdmins.confirmStatusTitle')}
        message={
          confirmAdmin
            ? t('superAdminAdmins.confirmStatusMessage', {
                name: confirmAdmin.name,
                status: t(ADMIN_STATUS_LABELS[(confirmAdmin.status ?? 'active') === 'active' ? 'inactive' : 'active']),
              })
            : ''
        }
        tone={(confirmAdmin?.status ?? 'active') === 'active' ? 'danger' : 'primary'}
        loading={togglingStatus}
        onConfirm={confirmToggleStatus}
        onClose={() => setConfirmAdmin(null)}
      />
    </div>
  )
}
