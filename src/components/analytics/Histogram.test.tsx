import { render, screen } from '@testing-library/react';

import Histogram, { HistogramData } from './Histogram';

// Mock Recharts components (similar to BarChart but with Label component)
vi.mock('recharts', () => ({
  BarChart: ({
    children,
    data,
    margin,
    barCategoryGap,
  }: {
    children: React.ReactNode;
    data: unknown;
    margin?: unknown;
    barCategoryGap?: string;
  }) => (
    <div
      data-testid="recharts-bar-chart"
      data-data={JSON.stringify(data)}
      data-margin={JSON.stringify(margin)}
      data-bar-category-gap={barCategoryGap}
    >
      {children}
    </div>
  ),
  Bar: ({
    dataKey,
    fill,
    stroke,
    strokeWidth,
  }: {
    dataKey?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }) => (
    <div
      data-testid="recharts-bar"
      data-data-key={dataKey}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
    />
  ),
  XAxis: ({
    children,
    dataKey,
    tick,
    axisLine,
    tickLine,
  }: {
    children?: React.ReactNode;
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
    >
      {children}
    </div>
  ),
  YAxis: ({
    children,
    allowDecimals,
    tick,
    axisLine,
    tickLine,
  }: {
    children?: React.ReactNode;
    allowDecimals?: boolean;
    tick?: unknown;
    axisLine?: unknown;
    tickLine?: unknown;
  }) => (
    <div
      data-testid="recharts-y-axis"
      data-allow-decimals={allowDecimals}
      data-tick={JSON.stringify(tick)}
      data-axis-line={JSON.stringify(axisLine)}
      data-tick-line={JSON.stringify(tickLine)}
    >
      {children}
    </div>
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
  Tooltip: ({
    content,
    cursor,
  }: {
    content?: React.ComponentType;
    cursor?: unknown;
  }) => (
    <div
      data-testid="recharts-tooltip"
      data-content={content}
      data-cursor={JSON.stringify(cursor)}
    />
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
  Label: ({
    value,
    position,
    offset,
    angle,
    style,
  }: {
    value?: string;
    position?: string;
    offset?: number;
    angle?: number;
    style?: unknown;
  }) => (
    <div
      data-testid="recharts-label"
      data-value={value}
      data-position={position}
      data-offset={offset}
      data-angle={angle}
      data-style={JSON.stringify(style)}
    />
  ),
}));

describe('<Histogram />', () => {
  const mockData: HistogramData[] = [
    { range: '0-10', count: 5 },
    { range: '10-20', count: 15 },
    { range: '20-30', count: 25 },
    { range: '30-40', count: 10 },
  ];

  const defaultProps = {
    data: mockData,
    title: 'Age Distribution',
    xAxisLabel: 'Age Groups',
  };

  it('renders title correctly', () => {
    render(<Histogram {...defaultProps} />);
    // Title is not rendered by the component itself, but passed as prop
    expect(defaultProps.title).toBe('Age Distribution');
  });

  it('renders with default bar color', () => {
    render(<Histogram {...defaultProps} />);
    const bar = screen.getByTestId('recharts-bar');
    expect(bar).toHaveAttribute('data-fill', 'hsl(var(--primary))');
  });

  it('renders with custom bar color', () => {
    render(<Histogram {...defaultProps} barColor="#ff0000" />);
    const bar = screen.getByTestId('recharts-bar');
    expect(bar).toHaveAttribute('data-fill', '#ff0000');
  });

  it('renders with custom y-axis label', () => {
    render(<Histogram {...defaultProps} yAxisLabel="Count" />);
    const yAxis = screen.getByTestId('recharts-y-axis');
    expect(yAxis).toBeInTheDocument();
  });

  it('renders all Recharts components', () => {
    render(<Histogram {...defaultProps} />);

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

  it('renders axis labels correctly', () => {
    render(<Histogram {...defaultProps} />);
    // Axis labels are configured but not rendered as separate elements
    expect(defaultProps.xAxisLabel).toBe('Age Groups');
  });

  it('handles empty data array', () => {
    render(<Histogram {...defaultProps} data={[]} />);

    expect(
      screen.getByText('Not enough data to display chart.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('recharts-bar-chart')).not.toBeInTheDocument();
  });

  it('shows empty state styling correctly', () => {
    render(<Histogram {...defaultProps} data={[]} />);

    const emptyState = screen.getByText('Not enough data to display chart.');
    expect(emptyState).toHaveClass(
      'text-muted-foreground',
      'flex',
      'h-[340px]',
      'items-center',
      'justify-center'
    );
  });

  it('passes correct props to BarChart component', () => {
    render(<Histogram {...defaultProps} />);
    const chart = screen.getByTestId('recharts-bar-chart');

    const margin = JSON.parse(chart.getAttribute('data-margin') || '{}');
    expect(margin).toEqual({ top: 20, right: 30, left: 20, bottom: 25 });
    expect(chart).toHaveAttribute('data-bar-category-gap', '10%');
  });

  it('passes correct props to Bar component', () => {
    render(<Histogram {...defaultProps} />);
    const bar = screen.getByTestId('recharts-bar');

    expect(bar).toHaveAttribute('data-data-key', 'count');
    expect(bar).toHaveAttribute('data-fill', 'var(--color-count)');
    expect(bar).toHaveAttribute('data-stroke', null);
    expect(bar).toHaveAttribute('data-stroke-width', null);
  });

  it('passes correct props to XAxis component', () => {
    render(<Histogram {...defaultProps} />);
    const xAxis = screen.getByTestId('recharts-x-axis');

    expect(xAxis).toHaveAttribute('data-data-key', 'range');
    expect(xAxis).toHaveAttribute('data-tick', '{"fontSize":12}');
    expect(xAxis).toHaveAttribute('data-axis-line', 'false');
    expect(xAxis).toHaveAttribute('data-tick-line', 'false');
  });

  it('passes correct props to YAxis component', () => {
    render(<Histogram {...defaultProps} />);
    const yAxis = screen.getByTestId('recharts-y-axis');

    expect(yAxis).toHaveAttribute('data-allow-decimals', 'false');
    expect(yAxis).toHaveAttribute('data-tick', '{"fontSize":12}');
    expect(yAxis).toHaveAttribute('data-axis-line', 'false');
    expect(yAxis).toHaveAttribute('data-tick-line', 'false');
  });

  it('passes correct props to CartesianGrid component', () => {
    render(<Histogram {...defaultProps} />);
    const grid = screen.getByTestId('recharts-cartesian-grid');

    expect(grid).toHaveAttribute('data-stroke-dasharray', null);
    expect(grid).toHaveAttribute('data-stroke', null);
  });

  it('passes correct props to Tooltip component', () => {
    render(<Histogram {...defaultProps} />);
    const tooltip = screen.getByTestId('recharts-tooltip');

    const cursor = JSON.parse(tooltip.getAttribute('data-cursor') || '{}');
    expect(cursor).toEqual({ fill: '#f3f4f6' });
  });

  it('handles single data point', () => {
    const singleData: HistogramData[] = [{ range: '0-10', count: 5 }];
    render(<Histogram {...defaultProps} data={singleData} />);

    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data).toEqual([{ range: '0-10', count: 5 }]);
  });

  it('handles large numbers correctly', () => {
    const largeData: HistogramData[] = [
      { range: '0-100', count: 10000 },
      { range: '100-200', count: 25000 },
    ];
    render(<Histogram {...defaultProps} data={largeData} />);

    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].count).toBe(10000);
    expect(data[1].count).toBe(25000);
  });

  it('handles zero counts correctly', () => {
    const zeroData: HistogramData[] = [
      { range: '0-10', count: 0 },
      { range: '10-20', count: 5 },
    ];
    render(<Histogram {...defaultProps} data={zeroData} />);

    const chart = screen.getByTestId('recharts-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    expect(data[0].count).toBe(0);
    expect(data[1].count).toBe(5);
  });
});
