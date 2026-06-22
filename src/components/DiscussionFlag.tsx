interface DiscussionFlagProps {
  active: boolean
  onToggle: () => void
}

// 要相談フラグのトグル。ONでタスクが一覧の最上位に浮上する。
export function DiscussionFlag({ active, onToggle }: DiscussionFlagProps) {
  return (
    <button
      type="button"
      className={`discussion-flag ${active ? 'active' : ''}`}
      onClick={onToggle}
      title="要相談（定例会で討論）"
      aria-pressed={active}
    >
      {active ? '🗣 要相談中' : '要相談にする'}
    </button>
  )
}
