Here's the fixed version with all missing closing brackets added:

```typescript
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(document.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {document.dueDate ? format(new Date(document.dueDate), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(document)}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(document)}
                            className="text-gray-600 hover:text-green-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            className="text-gray-600 hover:text-purple-600 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            {deletingId === document.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          {showDeleteConfirm === document.id && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
                                <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
                                <p className="text-gray-600 mb-6">
                                  Are you sure you want to delete "{document.name}"? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(document.id)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Modal */}
      {isViewerOpen && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          users={mockUsers}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentList;
```