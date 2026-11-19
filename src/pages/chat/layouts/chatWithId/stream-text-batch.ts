export function createStreamTextBatch(commit: (content: string, reasoning: string) => void) {
  let content = '';
  let reasoning = '';
  let frame: number | undefined;

  function flush() {
    if (frame !== undefined)
      cancelAnimationFrame(frame);
    frame = undefined;
    if (!content && !reasoning)
      return;

    const nextContent = content;
    const nextReasoning = reasoning;
    content = '';
    reasoning = '';
    commit(nextContent, nextReasoning);
  }

  function append(text: string, isReasoning = false) {
    if (!text)
      return;

    if (isReasoning)
      reasoning += text;
    else
      content += text;

    if (frame === undefined) {
      frame = requestAnimationFrame(() => {
        frame = undefined;
        flush();
      });
    }
  }

  return { append, flush };
}
