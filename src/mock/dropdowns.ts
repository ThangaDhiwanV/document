export const documentTypes = [
  { value: 'test_method', label: 'Test Method' },
  { value: 'sop', label: 'Standard Operating Procedure' },
  { value: 'coa', label: 'Certificate of Analysis' },
  { value: 'specification', label: 'Product Specification' },
  { value: 'protocol', label: 'Validation Protocol' },
  { value: 'report', label: 'Analytical Report' }
];

export const documentStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending_signature', label: 'Pending Signature' },
  { value: 'signed', label: 'Signed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' }
];

export const groupByOptions = [
  { value: 'None', label: 'None' },
  { value: 'Status', label: 'Status' },
  { value: 'Type', label: 'Type' },
  { value: 'Created By', label: 'Created By' },
  { value: 'Assigned To', label: 'Assigned To' }
];

export const sortOptions = [
  { value: 'Name', label: 'Name' },
  { value: 'Type', label: 'Type' },
  { value: 'Version', label: 'Version' },
  { value: 'Status', label: 'Status' },
  { value: 'Created By', label: 'Created By' },
  { value: 'Assigned To', label: 'Assigned To' },
  { value: 'Created Date', label: 'Created Date' },
  { value: 'Due Date', label: 'Due Date' }
];

export const dateFilterOptions = [
  { value: 'All Dates', label: 'All Dates' },
  { value: 'Today', label: 'Today' },
  { value: 'This Week', label: 'This Week' },
  { value: 'This Month', label: 'This Month' },
  { value: 'Last 30 Days', label: 'Last 30 Days' }
];