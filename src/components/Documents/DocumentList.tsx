import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Calendar, ChevronDown, ChevronUp, Eye, Edit, Download, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { mockTemplates, getDocumentTypeDisplayName } from '../../data/mockData';
