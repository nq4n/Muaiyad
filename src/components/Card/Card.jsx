import { cx } from "../../lib/utils";

export default function Card({ as: Tag = "section", className = "", children }) {
  return <Tag className={cx("card", className)}>{children}</Tag>;
}
