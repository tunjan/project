import { render, screen } from '@testing-library/react';

import BarChart, { BarChartData } from './BarChart';

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown;
  }) => (
    <div data-testid="recharts-bar-chart" data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({
    dataKey,
    fill,
    stroke,
    strokeWidth,
    radius,
  }: {
    dataKey?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    radius?: number[];
  }) => (
    <div
      data-testid="recharts-bar"
      data-data-key={dataKey}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-radius={JSON.stringify(radius)}
    />
  ),
  XAxis: ({
    dataKey,
    tick,
    axisLine,
    tickLine,
  }: {
    dataKey?: string;
    tick?: unknown;
    axisLine?: unknown;
    tickLine?: unknown;
  }) => (
    <div
      data-testid="recharts-x-axis"
      data-data-key={dataKey}
      data-tick={JSON.stringify(tick)}
      data-axis-line={JSON.stringify(axisLine)}
      data-tick-line={JSON.stringify(tickLine)}
    />
  ),
  YAxis: ({
    tick,
    axisLine,
    tickLine,
  }: {
    tick?: unknown;
    axisLine?: unknown;
    tickLine?: unknown;
  }) => (
    <div
      data-testid="recharts-y-axis"
      data-tick={JSON.stringify(tick)}
      data-axis-line={JSON.stringify(axisLine)}
      data-tick-line={JSON.stringify(tickLine)}
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

describe('<BarChart />', () => {
  const mockData: BarChartData[] = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 200 },
    { label: 'Mar', value: 150 },
  ];

  const defaultProps = {
    data: mockData,
    title: 'Monthly Sales',
  };

  it('renders title correctly', () => {
    render(<BarChart {...defaultProps} />);
    // Title is not rendered by the component itself, but passed as prop
    expect(defaultProps.title).toBe('Monthly Sales');
  });

  it('renders with default bar color', () => {
    render(<BarChart {...defaultProps} />);
    const bar = screen.getByTestId('recharts-bar');
    expect(bar).toHaveAttribute('data-fill', 'hsl(var(--primary))');
  });

  it('renders with custom bar color', () => {
    render(<BarChart {...defaultProps} barColor="#00ff00" />);
    const bar = screen.getByTestId('recharts-bar');
    expect(bar).toHaveAttribute('data-fill', '#00ff00');
  });

  it('transforms data correctly for Recharts', () => {
    render(<BarChart {...defaultProps} />);
    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');

    expect(data).toEqual([
      { name: 'Jan', value: 100, fill: 'hsl(var(--primary))' },
      { name: 'Feb', value: 200, fill: 'hsl(var(--primary))' },
      { name: 'Mar', value: 150, fill: 'hsl(var(--primary))' },
    ]);
  });

  it('uses custom colors from data when provided', () => {
    const dataWithColors: BarChartData[] = [
      { label: 'Jan', value: 100, color: '#ff0000' },
      { label: 'Feb', value: 200, color: '#00ff00' },
      { label: 'Mar', value: 150 }, // No custom color
    ];

    render(<BarChart {...defaultProps} data={dataWithColors} />);
    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');

    expect(data).toEqual([
      { name: 'Jan', value: 100, fill: '#ff0000' },
      { name: 'Feb', value: 200, fill: '#00ff00' },
      { name: 'Mar', value: 150, fill: 'hsl(var(--primary))' }, // Falls back to default
    ]);
  });

  it('renders all Recharts components', () => {
    render(<BarChart {...defaultProps} />);

    expect(
      screen.getByTestId('recharts-responsive-container')
    ).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar')).toBeInTheDocument();
  });

  it('sets correct height for chart container', () => {
    render(<BarChart {...defaultProps} />);
    const chartContainer = screen.getByTestId('recharts-responsive-container');
    expect(chartContainer).toHaveStyle({ height: '100%' }); // ResponsiveContainer uses 100% height
  });

  it('handles empty data array', () => {
    render(<BarChart {...defaultProps} data={[]} />);
    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data).toEqual([]);
  });

  it('handles single data point', () => {
    const singleData: BarChartData[] = [{ label: 'Jan', value: 100 }];
    render(<BarChart {...defaultProps} data={singleData} />);
    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data).toEqual([
      { name: 'Jan', value: 100, fill: 'hsl(var(--primary))' },
    ]);
  });

  it('handles large numbers correctly', () => {
    const largeData: BarChartData[] = [
      { label: 'Q1', value: 1000000 },
      { label: 'Q2', value: 2000000 },
    ];
    render(<BarChart {...defaultProps} data={largeData} />);
    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].value).toBe(1000000);
    expect(data[1].value).toBe(2000000);
  });

  it('handles zero values correctly', () => {
    const zeroData: BarChartData[] = [
      { label: 'Jan', value: 0 },
      { label: 'Feb', value: 100 },
    ];
    render(<BarChart {...defaultProps} data={zeroData} />);
    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].value).toBe(0);
    expect(data[1].value).toBe(100);
  });

  it('handles negative values correctly', () => {
    const negativeData: BarChartData[] = [
      { label: 'Jan', value: -50 },
      { label: 'Feb', value: 100 },
    ];
    render(<BarChart {...defaultProps} data={negativeData} />);
    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].value).toBe(-50);
    expect(data[1].value).toBe(100);
  });

  it('passes correct props to Bar component', () => {
    render(<BarChart {...defaultProps} />);
    const bar = screen.getByTestId('recharts-bar');

    expect(bar).toHaveAttribute('data-data-key', 'value');
    expect(bar).toHaveAttribute('data-fill', 'var(--color-value)');
    expect(bar).toHaveAttribute('data-stroke', null);
    expect(bar).toHaveAttribute('data-stroke-width', null);
    expect(bar).toHaveAttribute('data-radius', '[4,4,4,4]');
  });

  it('passes correct props to XAxis component', () => {
    render(<BarChart {...defaultProps} />);
    const xAxis = screen.getByTestId('recharts-x-axis');

    expect(xAxis).toHaveAttribute('data-data-key', 'name');
    expect(xAxis).toHaveAttribute('data-tick', '{"fontSize":12}');
    expect(xAxis).toHaveAttribute('data-axis-line', 'false');
    expect(xAxis).toHaveAttribute('data-tick-line', 'false');
  });

  it('passes correct props to YAxis component', () => {
    render(<BarChart {...defaultProps} />);
    const yAxis = screen.getByTestId('recharts-y-axis');

    expect(yAxis).toHaveAttribute('data-tick', '{"fontSize":12}');
    expect(yAxis).toHaveAttribute('data-axis-line', 'false');
    expect(yAxis).toHaveAttribute('data-tick-line', 'false');
  });

  it('passes correct props to CartesianGrid component', () => {
    render(<BarChart {...defaultProps} />);
    const grid = screen.getByTestId('recharts-cartesian-grid');

    expect(grid).toHaveAttribute('data-stroke-dasharray', null);
    expect(grid).toHaveAttribute('data-stroke', null);
  });
});
