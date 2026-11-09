export function Icons() {
  return (
    <svg className="icon-sprite" aria-hidden="true">
      <symbol id="i-cube" viewBox="0 0 24 24">
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="m5 12 4 4L19 6" />
      </symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24">
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </symbol>
      <symbol id="i-book" viewBox="0 0 24 24">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
      </symbol>
      <symbol id="i-reset" viewBox="0 0 24 24">
        <path d="M4 4v6h6M5.5 15A7 7 0 1 0 6 8.5L4 10" />
      </symbol>
    </svg>
  );
}
export function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true">
      <use href={"#i-" + name} />
    </svg>
  );
}
