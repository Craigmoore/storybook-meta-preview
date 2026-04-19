export default {
  title: 'Molecules/Greeting',
  args: { name: 'Stranger' },
  argTypes: {
    name: { control: 'text' },
  },
};

export const Default = {
  render: ({ name }) => `
    <p class="molecule">
      <span class="atom">Hello</span>
      <span class="atom">World</span>
      <em>${name}</em>
    </p>
  `,
};
