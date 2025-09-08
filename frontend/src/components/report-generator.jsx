import { memo, useRef, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  Box, 
  Grid, 
  List, 
  Alert,
  Paper,
  Button,
  Dialog,
  Select,
  Divider, 
  ListItem,
  MenuItem,
  TextField,
  IconButton,
  InputLabel, 
  Typography,
  DialogTitle,
  FormControl,
  ListItemText,
  DialogContent,
  InputAdornment,
  ListItemButton,
  CircularProgress
} from '@mui/material';

import axios from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function ReportGeneratorComponent({ 
  open, 
  onClose,
  selectedTransactionIds = null
}) {
  const reportRef = useRef();
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  
  // Form state
  const [reportType, setReportType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch users for selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users');
        setUsers(response.data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        console.error('Users fetch error response:', err.response?.data);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const filtered = users.filter(user => {
        const fullName = `${user.FIRSTNAME || ''} ${user.LASTNAME || ''}`.toLowerCase();
        const email = (user.EMAIL || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
      setShowSearchResults(true);
    } else {
      setFilteredUsers([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, users]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value === '') {
      setSelectedUser('');
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user.UID);
    setSearchQuery(`${user.FIRSTNAME} ${user.LASTNAME} (${user.EMAIL})`);
    setShowSearchResults(false);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow for click events
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  const handleGenerateReport = async () => {
    // If selectedTransactionIds is provided, skip date/user validation
    if (selectedTransactionIds && selectedTransactionIds.length > 0) {
      setGenerating(true);
      setError(null);
      setReportData(null);

      try {
        const response = await axios.get('/transactions');
        const allTransactions = response.data.transactions || [];
        
        // Filter to only selected transactions
        const selectedTransactions = allTransactions.filter(transaction => 
          selectedTransactionIds.includes(transaction.TRANSACTION_ID)
        );

        setReportData({
          transactions: selectedTransactions,
          reportType: 'selected',
          selectedUser: null,
          startDate: null,
          endDate: null,
          totalAmount: selectedTransactions.reduce((sum, t) => sum + parseFloat(t.AMOUNT), 0),
          transactionCount: selectedTransactions.length
        });
      } catch (err) {
        console.error('Error generating selected transactions report:', err);
        console.error('Report generation error response:', err.response?.data);
        setError('Failed to generate report. Please try again.');
      } finally {
        setGenerating(false);
      }
      return;
    }

    // Original logic for date-based reports
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (reportType === 'single' && !selectedUser) {
      setError('Please select a user for single user report');
      return;
    }

    setGenerating(true);
    setError(null);
    setReportData(null);

    try {
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      if (reportType === 'single') {
        params.userId = selectedUser;
      }

      const response = await axios.get('/transactions', { params });
      const transactions = response.data.transactions || [];
      
      // Filter transactions by date range
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.TRANSACTION_DATE);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      // Filter by user if single user report
      const finalTransactions = reportType === 'single' 
        ? filteredTransactions.filter(transaction => transaction.EMAIL === users.find(u => u.UID === selectedUser)?.EMAIL)
        : filteredTransactions;

      setReportData({
        transactions: finalTransactions,
        reportType,
        selectedUser: reportType === 'single' ? users.find(u => u.UID === selectedUser) : null,
        startDate,
        endDate,
        totalAmount: finalTransactions.reduce((sum, t) => sum + parseFloat(t.AMOUNT), 0),
        transactionCount: finalTransactions.length
      });
    } catch (err) {
      console.error('Error generating report:', err);
      console.error('Report generation error response:', err.response?.data);
      setError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    const originalContent = document.body.innerHTML;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Report</title>
          <style>
            @page {
              margin: 0.5in;
              size: A4;
            }
            body {
              font-family: monospace;
              margin: 0;
              padding: 20px;
              color: black;
              background: white;
              line-height: 1.4;
            }
            .transaction-block {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 20px;
            }
            .divider {
              margin: 15px 0;
              border-top: 1px solid #ccc;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .transaction-block { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleClose = () => {
    setReportData(null);
    setError(null);
    setReportType('all');
    setSelectedUser('');
    setStartDate(null);
    setEndDate(null);
    setSearchQuery('');
    setFilteredUsers([]);
    setShowSearchResults(false);
    onClose();
  };

  const formatDate = (date) => date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const formatCurrency = (amount) => new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Generate Transaction Report</Typography>
            <IconButton onClick={handleClose} size="small">
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 4 }}>
          {!reportData ? (
            <Box sx={{ mb: 3, mt: 2 }}>
              {selectedTransactionIds && selectedTransactionIds.length > 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Generate Report for Selected Transactions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {selectedTransactionIds.length} transaction{selectedTransactionIds.length !== 1 ? 's' : ''} selected
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleGenerateReport}
                    disabled={generating}
                    startIcon={generating ? <CircularProgress size={20} /> : <Iconify icon="eva:file-text-fill" />}
                  >
                    {generating ? 'Generating...' : 'Generate Report'}
                  </Button>
                </Box>
              ) : (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Report Type</InputLabel>
                        <Select
                          value={reportType}
                          label="Report Type"
                          onChange={(e) => setReportType(e.target.value)}
                        >
                          <MenuItem value="all">All Users</MenuItem>
                          <MenuItem value="single">Single User</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {reportType === 'single' && (
                      <Grid item xs={12}>
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            fullWidth
                            label="Search for a user"
                            placeholder="Type name or email to search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Iconify icon="eva:search-fill" />
                                </InputAdornment>
                              ),
                            }}
                          />
                          
                          {showSearchResults && filteredUsers.length > 0 && (
                            <Paper
                              sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                maxHeight: 300,
                                overflow: 'auto',
                                mt: 1,
                                boxShadow: 3
                              }}
                            >
                              <List dense>
                                {filteredUsers.map((user) => (
                                  <ListItem key={user.UID} disablePadding>
                                    <ListItemButton
                                      onClick={() => handleUserSelect(user)}
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: 'action.hover'
                                        }
                                      }}
                                    >
                                      <ListItemText
                                        primary={`${user.FIRSTNAME} ${user.LASTNAME}`}
                                        secondary={user.EMAIL}
                                        primaryTypographyProps={{
                                          fontWeight: 'medium'
                                        }}
                                      />
                                    </ListItemButton>
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          )}
                          
                          {showSearchResults && filteredUsers.length === 0 && searchQuery.trim().length >= 2 && (
                            <Paper
                              sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                mt: 1,
                                boxShadow: 3,
                                p: 2
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" textAlign="center">
                                No users found matching &ldquo;{searchQuery}&rdquo;
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                  </Grid>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleGenerateReport}
                      disabled={generating}
                      startIcon={generating ? <CircularProgress size={20} /> : <Iconify icon="eva:file-text-fill" />}
                    >
                      {generating ? 'Generating...' : 'Generate Report'}
                    </Button>
                    <Button variant="outlined" onClick={handleClose}>
                      Cancel
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Box>
              <Box 
                ref={reportRef}
                sx={{ 
                  p: 3,
                  backgroundColor: 'white',
                  color: 'black',
                  fontFamily: 'monospace',
                  '@media print': {
                    p: 2,
                    boxShadow: 'none',
                    backgroundColor: 'white !important',
                    color: 'black !important',
                    margin: 0,
                    padding: '20px',
                    minHeight: 'auto',
                    pageBreakInside: 'avoid',
                    overflow: 'visible'
                  }
                }}
              >
                {/* Report Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      '@media print': { fontSize: '1.5rem', color: 'black !important' }
                    }}
                  >
                    Al-Ansaar Islamic Foundation
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      '@media print': { color: 'black !important' }
                    }}
                  >
                    3770 Westwinds Dr NE Unit 320, Room #1, Calgary, AB T3J 5H3
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      '@media print': { color: 'black !important' }
                    }}
                  >
                    +1 855-633-6222 | info@al-ansaar.ca
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Report Title */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      '@media print': { color: 'black !important' }
                    }}
                  >
                    TRANSACTION REPORT
                  </Typography>
                </Box>

                {/* Report Summary */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 2,
                      '@media print': { color: 'black !important' }
                    }}
                  >
                    Report Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Transactions:</Typography>
                    <Typography variant="body2">{reportData.transactionCount}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total Amount:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(reportData.totalAmount)}
                    </Typography>
                  </Box>
                  
                  {reportData.reportType !== 'selected' && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Start Date:</Typography>
                        <Typography variant="body2">{formatDate(reportData.startDate)}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>End Date:</Typography>
                        <Typography variant="body2">{formatDate(reportData.endDate)}</Typography>
                      </Box>
                    </>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {reportData.selectedUser && (
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        '@media print': { color: 'black !important' }
                      }}
                    >
                      User Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Name:</Typography>
                      <Typography variant="body2">
                        {reportData.selectedUser.FIRSTNAME} {reportData.selectedUser.LASTNAME}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Email:</Typography>
                      <Typography variant="body2">{reportData.selectedUser.EMAIL}</Typography>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Transaction Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 2,
                      '@media print': { color: 'black !important' }
                    }}
                  >
                    Transaction Details
                  </Typography>
                  
                  {reportData.transactions.length > 0 ? (
                    <Box>
                      {reportData.transactions.map((transaction, index) => (
                        <Box 
                          key={transaction.TRANSACTION_ID} 
                          className="transaction-block"
                          sx={{ 
                            mb: 3,
                            '@media print': {
                              pageBreakInside: 'avoid',
                              breakInside: 'avoid',
                              marginBottom: '20px'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Receipt Number:</Typography>
                            <Typography variant="body2">{transaction.RECEIPT_NUMBER}</Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Donor Name:</Typography>
                            <Typography variant="body2">
                              {transaction.FIRSTNAME && transaction.LASTNAME 
                                ? `${transaction.FIRSTNAME} ${transaction.LASTNAME}` 
                                : 'Anonymous'
                              }
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Email:</Typography>
                            <Typography variant="body2">{transaction.EMAIL}</Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Amount:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(transaction.AMOUNT)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Payment Method:</Typography>
                            <Typography variant="body2">{transaction.METHOD}</Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date:</Typography>
                            <Typography variant="body2">
                              {new Date(transaction.TRANSACTION_DATE).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          {index < reportData.transactions.length - 1 && (
                            <Divider 
                              className="divider"
                              sx={{ 
                                mt: 2, 
                                mb: 2,
                                '@media print': {
                                  marginTop: '15px',
                                  marginBottom: '15px'
                                }
                              }} 
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      No transactions found for the selected criteria.
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      '@media print': { color: 'black !important' }
                    }}
                  >
                    Report generated on {formatDate(new Date())}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handlePrint}
                  startIcon={<Iconify icon="eva:printer-fill" />}
                >
                  Print Report
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setReportData(null)}
                >
                  Generate New Report
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}

export const ReportGenerator = memo(ReportGeneratorComponent);
