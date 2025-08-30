import { render, screen } from '@testing-library/react';

import LineChart, { LineChartData } from './LineChart';

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({
    children,
    data,
    margin,
  }: {
    children: React.ReactNode;
    data: unknown;
    margin?: unknown;
  }) => (
    <div
      data-testid="recharts-line-chart"
      data-data={JSON.stringify(data)}
      data-margin={JSON.stringify(margin)}
    >
      {children}
    </div>
  ),
  Line: ({
    type,
    dataKey,
    stroke,
    strokeWidth,
    dot,
    activeDot,
  }: {
    type?: string;
    dataKey?: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: unknown;
    activeDot?: unknown;
  }) => (
    <div
      data-testid="recharts-line"
      data-type={type}
      data-data-key={dataKey}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-dot={JSON.stringify(dot)}
      data-active-dot={JSON.stringify(activeDot)}
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

describe('<LineChart />', () => {
  const mockData: LineChartData[] = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 200 },
    { label: 'Mar', value: 150 },
    { label: 'Apr', value: 300 },
  ];

  const defaultProps = {
    data: mockData,
    title: 'Monthly Trends',
  };

  it('renders title correctly', () => {
    render(<LineChart {...defaultProps} />);
    expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
  });

  it('renders with default line color', () => {
    render(<LineChart {...defaultProps} />);
    const line = screen.getByTestId('recharts-line');
    expect(line).toHaveAttribute('data-stroke', '#d81313');
  });

  it('renders with custom line color', () => {
    render(<LineChart {...defaultProps} lineColor="#00ff00" />);
    const line = screen.getByTestId('recharts-line');
    expect(line).toHaveAttribute('data-stroke', '#00ff00');
  });

  it('transforms data correctly for Recharts', () => {
    render(<LineChart {...defaultProps} />);
    const chart = screen.getByTestId('recharts-line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');

    expect(data).toEqual([
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 200 },
      { name: 'Mar', value: 150 },
      { name: 'Apr', value: 300 },
    ]);
  });

  it('renders all Recharts components', () => {
    render(<LineChart {...defaultProps} />);

    expect(
      screen.getByTestId('recharts-responsive-container')
    ).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line')).toBeInTheDocument();
  });

  it('applies correct styling to container', () => {
    render(<LineChart {...defaultProps} />);
    const container = screen.getByText('Monthly Trends').closest('div');
    expect(container).toHaveClass(
      'border-2',
      'border-black',
      'bg-white',
      'p-4',
      'md:p-6'
    );
  });

  it('applies correct styling to title', () => {
    render(<LineChart {...defaultProps} />);
    const title = screen.getByText('Monthly Trends');
    expect(title).toHaveClass('mb-4', 'text-lg', 'font-bold', 'text-black');
  });

  it('handles empty data array', () => {
    render(<LineChart {...defaultProps} data={[]} />);

    expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
    expect(
      screen.getByText('Not enough data to display chart.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('recharts-line-chart')).not.toBeInTheDocument();
  });

  it('shows empty state styling correctly', () => {
    render(<LineChart {...defaultProps} data={[]} />);

    const emptyState = screen.getByText('Not enough data to display chart.');
    expect(emptyState).toHaveClass(
      'text-neutral-500',
      'flex',
      'h-[300px]',
      'items-center',
      'justify-center'
    );
  });

  it('passes correct props to LineChart component', () => {
    render(<LineChart {...defaultProps} />);
    const chart = screen.getByTestId('recharts-line-chart');

    const margin = JSON.parse(chart.getAttribute('data-margin') || '{}');
    expect(margin).toEqual({ top: 20, right: 30, left: 20, bottom: 5 });
  });

  it('passes correct props to Line component', () => {
    render(<LineChart {...defaultProps} />);
    const line = screen.getByTestId('recharts-line');

    expect(line).toHaveAttribute('data-type', 'monotone');
    expect(line).toHaveAttribute('data-data-key', 'value');
    expect(line).toHaveAttribute('data-stroke', '#d81313');
    expect(line).toHaveAttribute('data-stroke-width', '3');

    const dot = JSON.parse(line.getAttribute('data-dot') || '{}');
    expect(dot).toEqual({ fill: '#d81313', strokeWidth: 2, r: 4 });

    const activeDot = JSON.parse(line.getAttribute('data-active-dot') || '{}');
    expect(activeDot).toEqual({
      r: 6,
      stroke: '#d81313',
      strokeWidth: 2,
      fill: '#ffffff',
    });
  });

  it('passes correct props to XAxis component', () => {
    render(<LineChart {...defaultProps} />);
    const xAxis = screen.getByTestId('recharts-x-axis');

    expect(xAxis).toHaveAttribute('data-data-key', 'name');
    expect(xAxis).toHaveAttribute(
      'data-tick',
      '{"fontSize":12,"fill":"#000000"}'
    );
    expect(xAxis).toHaveAttribute('data-axis-line', '{"stroke":"#000000"}');
    expect(xAxis).toHaveAttribute('data-tick-line', '{"stroke":"#000000"}');
  });

  it('passes correct props to YAxis component', () => {
    render(<LineChart {...defaultProps} />);
    const yAxis = screen.getByTestId('recharts-y-axis');

    expect(yAxis).toHaveAttribute(
      'data-tick',
      '{"fontSize":12,"fill":"#6b7280"}'
    );
    expect(yAxis).toHaveAttribute('data-axis-line', '{"stroke":"#000000"}');
    expect(yAxis).toHaveAttribute('data-tick-line', '{"stroke":"#000000"}');
  });

  it('passes correct props to CartesianGrid component', () => {
    render(<LineChart {...defaultProps} />);
    const grid = screen.getByTestId('recharts-cartesian-grid');

    expect(grid).toHaveAttribute('data-stroke-dasharray', '3 3');
    expect(grid).toHaveAttribute('data-stroke', '#e5e7eb');
  });

  it('handles single data point', () => {
    const singleData: LineChartData[] = [{ label: 'Jan', value: 100 }];
    render(<LineChart {...defaultProps} data={singleData} />);

    const chart = screen.getByTestId('recharts-line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data).toEqual([{ name: 'Jan', value: 100 }]);
  });

  it('handles large numbers correctly', () => {
    const largeData: LineChartData[] = [
      { label: 'Q1', value: 100000 },
      { label: 'Q2', value: 200000 },
    ];
    render(<LineChart {...defaultProps} data={largeData} />);

    const chart = screen.getByTestId('recharts-line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].value).toBe(100000);
    expect(data[1].value).toBe(200000);
  });

  it('handles zero values correctly', () => {
    const zeroData: LineChartData[] = [
      { label: 'Jan', value: 0 },
      { label: 'Feb', value: 100 },
      { label: 'Mar', value: 0 },
    ];
    render(<LineChart {...defaultProps} data={zeroData} />);

    const chart = screen.getByTestId('recharts-line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].value).toBe(0);
    expect(data[1].value).toBe(100);
    expect(data[2].value).toBe(0);
  });

  it('handles negative values correctly', () => {
    const negativeData: LineChartData[] = [
      { label: 'Jan', value: -50 },
      { label: 'Feb', value: 100 },
      { label: 'Mar', value: -25 },
    ];
    render(<LineChart {...defaultProps} data={negativeData} />);

    const chart = screen.getByTestId('recharts-line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].value).toBe(-50);
    expect(data[1].value).toBe(100);
    expect(data[2].value).toBe(-25);
  });

  it('maintains data integrity with special characters in labels', () => {
    const specialData: LineChartData[] = [
      { label: 'Q1-2023', value: 100 },
      { label: 'Q2-2023', value: 200 },
    ];
    render(<LineChart {...defaultProps} data={specialData} />);

    const chart = screen.getByTestId('recharts-line-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].name).toBe('Q1-2023');
    expect(data[1].name).toBe('Q2-2023');
  });
});
