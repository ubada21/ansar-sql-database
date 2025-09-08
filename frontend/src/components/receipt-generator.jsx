import { memo, useRef } from 'react';

import { 
  Box, 
  Button, 
  Dialog, 
  Divider, 
  IconButton, 
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function ReceiptGeneratorComponent({ 
  open, 
  onClose, 
  transaction, 
  organizationName = "Al-Ansaar Islamic Foundation",
  organizationAddress = "3770 Westwinds Dr NE Unit 320, Room #1, Calgary, AB T3J 5H3",
  organizationPhone = "+1 855-633-6222",
  organizationEmail = "info@al-ansaar.ca"
}) {
  const receiptRef = useRef();

  if (!transaction) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Reload the page to restore the original content
    window.location.reload();
  };


  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Receipt</Typography>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box 
          ref={receiptRef}
          sx={{ 
            p: 3,
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'monospace',
            '@media print': {
              p: 2,
              boxShadow: 'none',
              backgroundColor: 'white !important',
              color: 'black !important'
            }
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                '@media print': { fontSize: '1.5rem', color: 'black !important' }
              }}
            >
              {organizationName}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                '@media print': { color: 'black !important' }
              }}
            >
              {organizationAddress}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                '@media print': { color: 'black !important' }
              }}
            >
              {organizationPhone} | {organizationEmail}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Receipt Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                '@media print': { color: 'black !important' }
              }}
            >
              DONATION RECEIPT
            </Typography>
          </Box>

          {/* Receipt Details */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Receipt Number:</Typography>
              <Typography variant="body2">{transaction.RECEIPT_NUMBER}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date:</Typography>
              <Typography variant="body2">{formatDate(transaction.TRANSACTION_DATE)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Time:</Typography>
              <Typography variant="body2">{formatTime(transaction.TRANSACTION_DATE)}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Donor Information */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                '@media print': { color: 'black !important' }
              }}
            >
              Donor Information
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Name:</Typography>
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

            {transaction.ADDRESS && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Address:</Typography>
                <Typography variant="body2">
                  {transaction.ADDRESS}
                  {transaction.CITY && `, ${transaction.CITY}`}
                  {transaction.PROVINCE && `, ${transaction.PROVINCE}`}
                  {transaction.POSTALCODE && ` ${transaction.POSTALCODE}`}
                </Typography>
              </Box>
            )}
          </Box>

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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Amount:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${parseFloat(transaction.AMOUNT).toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Payment Method:</Typography>
              <Typography variant="body2">{transaction.METHOD}</Typography>
            </Box>

            {transaction.NOTES && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Notes:</Typography>
                <Typography variant="body2">{transaction.NOTES}</Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontStyle: 'italic',
                '@media print': { color: 'black !important' }
              }}
            >
              Thank you for your generous donation. This receipt is for tax purposes.
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                mt: 1,
                '@media print': { color: 'black !important' }
              }}
            >
              Generated on {formatDate(new Date())} at {formatTime(new Date())}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={handlePrint} variant="contained" startIcon={<Iconify icon="eva:printer-fill" />}>
          Print Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const ReceiptGenerator = memo(ReceiptGeneratorComponent);
