import QRCode from "qrcode";

type Props = {
  url: string;
  /** 生成边长（像素） */
  size?: number;
};

/** 服务端生成问卷链接二维码（PNG Data URL） */
export async function SurveyQrImage({ url, size = 220 }: Props) {
  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#18181b", light: "#ffffff" },
  });

  return (
    <div className="inline-flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="问卷链接二维码" width={size} height={size} className="rounded-lg border border-zinc-200" />
      <span className="text-xs text-zinc-500">扫码打开填写页</span>
    </div>
  );
}
