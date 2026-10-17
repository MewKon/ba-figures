/**
 * 价格货币选择器 —— 顶栏右侧的一个按钮 + 点开的弹窗。
 *
 * 弹窗里必须写清换算口径：价格是按日元定价的**指示性换算**，
 * 不含关税 / 国际运费 / 代购费，否则用户会把它当成到手价。
 */
import { useCurrency } from '../../hooks/useCurrency';
import { CURRENCIES, RATES_AS_OF, currencyDef } from '../../lib/currency';
import { Modal } from '../ui/Modal';
import styles from './CurrencyPicker.module.css';

export function CurrencyPicker() {
  const { code, setCode, picking, openPicker, closePicker } = useCurrency();
  const def = currencyDef(code);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={picking}
        title={`显示货币：${def.label}（点选切换）`}
      >
        <span className={styles.symbol}>{def.symbol}</span>
        <span className={styles.label}>{def.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Modal open={picking} onClose={closePicker} title="显示货币">
        <ul className={styles.list}>
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                className={`${styles.option} ${c.code === code ? styles.on : ''}`}
                onClick={() => {
                  setCode(c.code);
                  closePicker();
                }}
                aria-pressed={c.code === code}
              >
                <span className={styles.optSymbol}>{c.symbol}</span>
                <span className={styles.optLabel}>{c.label}</span>
                <span className={styles.optCode}>{c.code}</span>
                {c.code === code && (
                  <span className={styles.check} aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <p className={styles.note}>
          价格按商品的原价（日元）换算，<strong>不含关税、国际运费、代购手续费等</strong>，
          实际到手价请以商家结算页为准。
          <span className={styles.rate}>
            汇率参考：100 日元 ≈ 人民币 4.85 元 / 韩元 920 / 美元 0.67（{RATES_AS_OF}）
          </span>
        </p>
      </Modal>
    </>
  );
}
