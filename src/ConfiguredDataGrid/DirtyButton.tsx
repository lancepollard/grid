import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Button } from 'antd';
import { DataGridManager, DataGridEventType } from '@components/DataGrid';

type DirtyButtonPropsType = {
  children: React.ReactNode;
  grid: DataGridManager;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (changes: Record<string, any>) => void;
};

function DirtyButton({
  grid,
  onSubmit,
  children,
}: DirtyButtonPropsType): ReactElement {
  const [isDisabled, setIsDisabled] = useState(true);

  const handleSubmit = useCallback(() => {
    setIsDisabled(true);
    const map = grid.exportChanges();
    onSubmit(map);
  }, [grid, onSubmit, setIsDisabled]);

  useEffect(() => {
    const handleDirty = ({ value }: DataGridEventType<boolean>): void => {
      setIsDisabled(!value);
    };

    grid.bindDirty(handleDirty);

    return () => grid.unbindDirty();
  }, [grid, setIsDisabled]);

  return (
    <Button onClick={handleSubmit} disabled={isDisabled} type="primary">
      {children}
    </Button>
  );
}

export default DirtyButton;
