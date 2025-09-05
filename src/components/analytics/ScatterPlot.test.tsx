import { render, screen } from '@testing-library/react';

import ScatterPlot, { ScatterPlotData } from './ScatterPlot';

// Mock Recharts components
vi.mock('recharts', () => ({
  ScatterChart: ({
    children,
    data,
    margin,
  }: {
    children: React.ReactNode;
    data: unknown;
    margin?: unknown;
  }) => (
    <div
      data-testid="recharts-scatter-chart"
      data-data={JSON.stringify(data)}
      data-margin={JSON.stringify(margin)}
    >
      {children}
    </div>
  ),
  Scatter: ({
    dataKey,
    fill,
    stroke,
    strokeWidth,
    r,
  }: {
    dataKey?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    r?: number;
  }) => (
    <div
      data-testid="recharts-scatter"
      data-data-key={dataKey}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-r={r}
    />
  ),
  XAxis: ({
    type,
    dataKey,
    name,
    tick,
    axisLine,
    tickLine,
    label,
  }: {
    type?: string;
    dataKey?: string;
    name?: string;
    tick?: unknown;
    axisLine?: unknown;
    tickLine?: unknown;
    label?: unknown;
  }) => (
    <div
      data-testid="recharts-x-axis"
      data-type={type}
      data-data-key={dataKey}
      data-name={name}
      data-tick={JSON.stringify(tick)}
      data-axis-line={JSON.stringify(axisLine)}
      data-tick-line={JSON.stringify(tickLine)}
      data-label={JSON.stringify(label)}
    />
  ),
  YAxis: ({
    type,
    dataKey,
    name,
    tick,
    axisLine,
    tickLine,
    label,
  }: {
    type?: string;
    dataKey?: string;
    name?: string;
    tick?: unknown;
    axisLine?: unknown;
    tickLine?: unknown;
    label?: unknown;
  }) => (
    <div
      data-testid="recharts-y-axis"
      data-type={type}
      data-data-key={dataKey}
      data-name={name}
      data-tick={JSON.stringify(tick)}
      data-axis-line={JSON.stringify(axisLine)}
      data-tick-line={JSON.stringify(tickLine)}
      data-label={JSON.stringify(label)}
    />
  ),
  CartesianGrid: ({
    strokeDasharray,
    stroke,
  }: {
    strokeDasharray?: string;
    stroke?: string;
  }) => (
    <div
      data-testid="recharts-cartesian-grid"
      data-stroke-dasharray={strokeDasharray}
      data-stroke={stroke}
    />
  ),
  Tooltip: ({ content }: { content?: React.ComponentType }) => (
    <div data-testid="recharts-tooltip" data-content={content} />
  ),
  ResponsiveContainer: ({
    children,
    width,
    height,
  }: {
    children: React.ReactNode;
    width?: string | number;
    height?: string | number;
  }) => (
    <div
      data-testid="recharts-responsive-container"
      data-width={width}
      data-height={height}
      style={{ width, height }}
    >
      {children}
    </div>
  ),
}));

describe('<ScatterPlot />', () => {
  const mockData: ScatterPlotData[] = [
    { label: 'Point A', x: 10, y: 20 },
    { label: 'Point B', x: 15, y: 25 },
    { label: 'Point C', x: 20, y: 30 },
    { label: 'Point D', x: 25, y: 35 },
  ];

  const defaultProps = {
    data: mockData,
    title: 'Correlation Analysis',
    xAxisLabel: 'Hours',
    yAxisLabel: 'Conversations',
  };

  it('renders title correctly', () => {
    render(<ScatterPlot {...defaultProps} />);
    // Title is not rendered by the component itself, but passed as prop
    expect(defaultProps.title).toBe('Correlation Analysis');
  });

  it('renders axis labels correctly', () => {
    render(<ScatterPlot {...defaultProps} />);
    // Axis labels are passed as props but not rendered as text by the component
    expect(defaultProps.xAxisLabel).toBe('Hours');
    expect(defaultProps.yAxisLabel).toBe('Conversations');
  });

  it('transforms data correctly for Recharts', () => {
    render(<ScatterPlot {...defaultProps} />);
    const chart = screen.getByTestId('recharts-scatter-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');

    expect(data).toEqual([
      { label: 'Point A', x: 10, y: 20, name: 'Point A' },
      { label: 'Point B', x: 15, y: 25, name: 'Point B' },
      { label: 'Point C', x: 20, y: 30, name: 'Point C' },
      { label: 'Point D', x: 25, y: 35, name: 'Point D' },
    ]);
  });

  it('renders all Recharts components', () => {
    render(<ScatterPlot {...defaultProps} />);

    expect(
      screen.getByTestId('recharts-responsive-container')
    ).toBeInTheDocument();
    expect(screen.getByTestId('recharts-scatter-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-scatter')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    render(<ScatterPlot {...defaultProps} data={[]} />);

    expect(
      screen.getByText('Not enough data to display chart.')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('recharts-scatter-chart')
    ).not.toBeInTheDocument();
  });

  it('shows empty state styling correctly', () => {
    render(<ScatterPlot {...defaultProps} data={[]} />);

    const emptyState = screen.getByText('Not enough data to display chart.');
    expect(emptyState).toHaveClass(
      'text-muted-foreground',
      'flex',
      'h-[340px]',
      'items-center',
      'justify-center'
    );
  });

  it('passes correct props to ScatterChart component', () => {
    render(<ScatterPlot {...defaultProps} />);
    const chart = screen.getByTestId('recharts-scatter-chart');

    const margin = JSON.parse(chart.getAttribute('data-margin') || '{}');
    expect(margin).toEqual({ top: 20, right: 30, left: 20, bottom: 60 });
  });

  it('passes correct props to Scatter component', () => {
    render(<ScatterPlot {...defaultProps} />);
    const scatter = screen.getByTestId('recharts-scatter');

    expect(scatter).toHaveAttribute('data-data-key', 'y');
    expect(scatter).toHaveAttribute('data-fill', 'var(--color-y)');
    expect(scatter).toHaveAttribute('data-stroke', null);
    expect(scatter).toHaveAttribute('data-stroke-width', null);
    expect(scatter).toHaveAttribute('data-r', '6');
  });

  it('passes correct props to XAxis component', () => {
    render(<ScatterPlot {...defaultProps} />);
    const xAxis = screen.getByTestId('recharts-x-axis');

    expect(xAxis).toHaveAttribute('data-type', 'number');
    expect(xAxis).toHaveAttribute('data-data-key', 'x');
    expect(xAxis).toHaveAttribute('data-tick', '{"fontSize":12}');
    expect(xAxis).toHaveAttribute('data-axis-line', 'false');
    expect(xAxis).toHaveAttribute('data-tick-line', 'false');
  });

  it('passes correct props to YAxis component', () => {
    render(<ScatterPlot {...defaultProps} />);
    const yAxis = screen.getByTestId('recharts-y-axis');

    expect(yAxis).toHaveAttribute('data-type', 'number');
    expect(yAxis).toHaveAttribute('data-data-key', 'y');
    expect(yAxis).toHaveAttribute('data-tick', '{"fontSize":12}');
    expect(yAxis).toHaveAttribute('data-axis-line', 'false');
    expect(yAxis).toHaveAttribute('data-tick-line', 'false');
  });

  it('passes correct props to CartesianGrid component', () => {
    render(<ScatterPlot {...defaultProps} />);
    const grid = screen.getByTestId('recharts-cartesian-grid');

    expect(grid).toHaveAttribute('data-stroke-dasharray', null);
    expect(grid).toHaveAttribute('data-stroke', null);
  });

  it('handles single data point', () => {
    const singleData: ScatterPlotData[] = [
      { label: 'Single Point', x: 10, y: 20 },
    ];
    render(<ScatterPlot {...defaultProps} data={singleData} />);

    const chart = screen.getByTestId('recharts-scatter-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data).toEqual([
      { label: 'Single Point', x: 10, y: 20, name: 'Single Point' },
    ]);
  });

  it('handles zero and negative values correctly', () => {
    const mixedData: ScatterPlotData[] = [
      { label: 'Origin', x: 0, y: 0 },
      { label: 'Negative X', x: -10, y: 20 },
      { label: 'Negative Y', x: 10, y: -20 },
      { label: 'Both Negative', x: -15, y: -25 },
    ];
    render(<ScatterPlot {...defaultProps} data={mixedData} />);

    const chart = screen.getByTestId('recharts-scatter-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0]).toEqual({ label: 'Origin', x: 0, y: 0, name: 'Origin' });
    expect(data[1]).toEqual({
      label: 'Negative X',
      x: -10,
      y: 20,
      name: 'Negative X',
    });
    expect(data[2]).toEqual({
      label: 'Negative Y',
      x: 10,
      y: -20,
      name: 'Negative Y',
    });
    expect(data[3]).toEqual({
      label: 'Both Negative',
      x: -15,
      y: -25,
      name: 'Both Negative',
    });
  });

  it('handles large coordinate values', () => {
    const largeData: ScatterPlotData[] = [
      { label: 'Large Values', x: 10000, y: 50000 },
      { label: 'Small Values', x: 1, y: 2 },
    ];
    render(<ScatterPlot {...defaultProps} data={largeData} />);

    const chart = screen.getByTestId('recharts-scatter-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].x).toBe(10000);
    expect(data[0].y).toBe(50000);
    expect(data[1].x).toBe(1);
    expect(data[1].y).toBe(2);
  });

  it('handles decimal coordinate values', () => {
    const decimalData: ScatterPlotData[] = [
      { label: 'Point 1', x: 10.5, y: 20.3 },
      { label: 'Point 2', x: 15.7, y: 25.9 },
    ];
    render(<ScatterPlot {...defaultProps} data={decimalData} />);

    const chart = screen.getByTestId('recharts-scatter-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].x).toBe(10.5);
    expect(data[0].y).toBe(20.3);
    expect(data[1].x).toBe(15.7);
    expect(data[1].y).toBe(25.9);
  });

  it('maintains data integrity with special characters in labels', () => {
    const specialData: ScatterPlotData[] = [
      { label: 'Point-1@#$%', x: 10, y: 20 },
      { label: 'Point 2 (test)', x: 15, y: 25 },
    ];
    render(<ScatterPlot {...defaultProps} data={specialData} />);

    const chart = screen.getByTestId('recharts-scatter-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].label).toBe('Point-1@#$%');
    expect(data[0].name).toBe('Point-1@#$%');
    expect(data[1].label).toBe('Point 2 (test)');
    expect(data[1].name).toBe('Point 2 (test)');
  });
});
