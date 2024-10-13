import React from 'react'

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="mt-2">{children}</div>
);

export const DialogHeader: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>
);

export const DialogFooter: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="mt-4 flex justify-end space-x-2">{children}</div>
);