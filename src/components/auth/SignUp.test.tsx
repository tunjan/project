import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from './SignUp';
import { Chapter } from '@/types';

const mockChapters: Chapter[] = [
  { name: 'Berlin', country: 'Germany', lat: 0, lng: 0 },
  { name: 'Hamburg', country: 'Germany', lat: 0, lng: 0 },
];

describe('<SignUp />', () => {
  it('renders all form fields and a submit button', () => {
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /Local Chapter/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Submit Application/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={vi.fn()}
      />
    );

    const submitButton = screen.getByRole('button', {
      name: /Submit Application/i,
    });
    await user.click(submitButton);

    // Zod errors should appear
    expect(
      await screen.findByText('Name must be at least 2 characters')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
  });

  it('calls onRegister with correctly structured data on valid submission', async () => {
    const user = userEvent.setup();
    const onRegisterMock = vi.fn();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={onRegisterMock}
        onNavigateLogin={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await user.type(
      screen.getByLabelText(/Email Address/i),
      'test@example.com'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Local Chapter/i }),
      'Berlin'
    );
    await user.type(
      screen.getByLabelText(/Why did you go vegan?/i),
      'This is a valid reason.'
    );
    await user.click(screen.getByLabelText('Yes')); // For the radio button
    await user.type(
      screen.getByLabelText(/How can you best contribute/i),
      'This is another valid answer.'
    );

    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(onRegisterMock).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      instagram: '',
      chapter: 'Berlin',
      answers: {
        veganReason: 'This is a valid reason.',
        abolitionistAlignment: true,
        customAnswer: 'This is another valid answer.',
      },
    });
  });

  it('handles Instagram handle input correctly', async () => {
    const user = userEvent.setup();
    const onRegisterMock = vi.fn();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={onRegisterMock}
        onNavigateLogin={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await user.type(
      screen.getByLabelText(/Email Address/i),
      'test@example.com'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Local Chapter/i }),
      'Berlin'
    );
    await user.type(screen.getByLabelText(/Instagram Handle/i), '@testuser');
    await user.type(
      screen.getByLabelText(/Why did you go vegan?/i),
      'This is a valid reason.'
    );
    await user.click(screen.getByLabelText('Yes'));
    await user.type(
      screen.getByLabelText(/How can you best contribute/i),
      'This is another valid answer.'
    );

    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(onRegisterMock).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      instagram: '@testuser',
      chapter: 'Berlin',
      answers: {
        veganReason: 'This is a valid reason.',
        abolitionistAlignment: true,
        customAnswer: 'This is another valid answer.',
      },
    });
  });

  it('calls onNavigateLogin when login link is clicked', async () => {
    const user = userEvent.setup();
    const onNavigateLoginMock = vi.fn();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={onNavigateLoginMock}
      />
    );

    const loginButton = screen.getByRole('button', { name: /Log In/i });
    await user.click(loginButton);

    expect(onNavigateLoginMock).toHaveBeenCalled();
  });

  it('validates minimum name length', async () => {
    const user = userEvent.setup();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'A');
    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(
      await screen.findByText('Name must be at least 2 characters')
    ).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Email Address/i), 'invalid-email');
    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
  });

  it('requires chapter selection', async () => {
    const user = userEvent.setup();
    render(
      <SignUp chapters={[]} onRegister={vi.fn()} onNavigateLogin={vi.fn()} />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await user.type(
      screen.getByLabelText(/Email Address/i),
      'test@example.com'
    );
    // Don't select a chapter
    await user.type(
      screen.getByLabelText(/Why did you go vegan?/i),
      'This is a valid reason.'
    );
    await user.click(screen.getByLabelText('Yes'));
    await user.type(
      screen.getByLabelText(/How can you best contribute/i),
      'This is another valid answer.'
    );

    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(
      await screen.findByText('Please select a chapter')
    ).toBeInTheDocument();
  });

  it('requires vegan reason answer', async () => {
    const user = userEvent.setup();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await user.type(
      screen.getByLabelText(/Email Address/i),
      'test@example.com'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Local Chapter/i }),
      'Berlin'
    );
    // Don't provide vegan reason
    await user.click(screen.getByLabelText('Yes'));
    await user.type(
      screen.getByLabelText(/How can you best contribute/i),
      'This is another valid answer.'
    );

    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(
      await screen.findByText('Please provide a reason (min. 10 characters)')
    ).toBeInTheDocument();
  });

  it('requires abolitionist alignment answer', async () => {
    const user = userEvent.setup();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await user.type(
      screen.getByLabelText(/Email Address/i),
      'test@example.com'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Local Chapter/i }),
      'Berlin'
    );
    await user.type(
      screen.getByLabelText(/Why did you go vegan?/i),
      'This is a valid reason.'
    );
    // Don't select abolitionist alignment
    await user.type(
      screen.getByLabelText(/How can you best contribute/i),
      'This is another valid answer.'
    );

    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(
      await screen.findByText('Please select an option')
    ).toBeInTheDocument();
  });

  it('requires contribution answer', async () => {
    const user = userEvent.setup();
    render(
      <SignUp
        chapters={mockChapters}
        onRegister={vi.fn()}
        onNavigateLogin={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await user.type(
      screen.getByLabelText(/Email Address/i),
      'test@example.com'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Local Chapter/i }),
      'Berlin'
    );
    await user.type(
      screen.getByLabelText(/Why did you go vegan?/i),
      'This is a valid reason.'
    );
    await user.click(screen.getByLabelText('Yes'));
    // Don't provide contribution answer

    await user.click(
      screen.getByRole('button', { name: /Submit Application/i })
    );

    expect(
      await screen.findByText('Please provide an answer (min. 10 characters)')
    ).toBeInTheDocument();
  });
});
