//! Theseus error type
use std::sync::Arc;

use crate::{profile, util};
use data_url::DataUrlError;
use tracing_error::InstrumentError;

#[derive(thiserror::Error, Debug)]
pub enum ErrorKind {
    #[error("文件系统错误：{0}")]
    FSError(String),

    #[error("序列化错误（INI）：{0}")]
    INIError(#[from] serde_ini::de::Error),

    #[error("序列化错误（JSON）：{0}")]
    JSONError(#[from] serde_json::Error),

    #[error("序列化错误（NBT）：{0}")]
    NBTError(#[from] quartz_nbt::io::NbtIoError),

    #[error("NBT 数据结构错误：{0}")]
    NBTReprError(#[from] quartz_nbt::NbtReprError),

    #[error("序列化错误（WebSocket）：{0}")]
    WebsocketSerializationError(
        #[from] ariadne::networking::serialization::SerializationError,
    ),

    #[error("无法解析 UUID：{0}")]
    UUIDError(#[from] uuid::Error),

    #[error("无法解析 URL：{0}")]
    URLError(#[from] url::ParseError),

    #[error("无法从任何源读取 {0}")]
    NoValueFor(String),

    #[error("元数据错误：{0}")]
    MetadataError(#[from] daedalus::Error),

    #[error("Minecraft 鉴权错误：{0}")]
    MinecraftAuthenticationError(
        #[from] crate::state::MinecraftAuthenticationError,
    ),

    #[error("输入/输出错误：{0}")]
    IOError(#[from] util::io::IOError),

    #[error("输入/输出（std）错误：{0}")]
    StdIOError(#[from] std::io::Error),

    #[error("无法启动 Minecraft：{0}")]
    LauncherError(String),

    #[error("无法从 URL 获取内容：{0}")]
    FetchError(#[from] reqwest::Error),

    #[error("Websocket 错误：{0}")]
    WSError(#[from] async_tungstenite::tungstenite::Error),

    #[error("Websocket 在 {0} 被接收前关闭！")]
    WSClosedError(String),

    #[error("文件下载 Sha1 校验错误：{0} != {1}")]
    HashError(String, String),

    #[error("正则表达式错误：{0}")]
    RegexError(#[from] regex::Error),

    #[error("存储在数据库中的路径必须是有效的 UTF-8 文本：{0}")]
    UTFError(std::path::PathBuf),

    #[error("无效输入：{0}")]
    InputError(String),

    #[error("Join handle error: {0}")]
    JoinError(#[from] tokio::task::JoinError),

    #[error("Recv error: {0}")]
    RecvError(#[from] tokio::sync::oneshot::error::RecvError),

    #[error("Error acquiring semaphore: {0}")]
    AcquireError(#[from] tokio::sync::AcquireError),

    #[error("账户 {0} 不由此应用管理！")]
    UnmanagedProfileError(String),

    #[error("无法创建账户：{0}")]
    ProfileCreationError(#[from] profile::create::ProfileCreationError),

    #[error("账户未登录，没有可用凭据！")]
    NoCredentialsError,

    #[error("JRE 错误：{0}")]
    JREError(#[from] crate::util::jre::JREError),

    #[error("无法解析日期：{0}")]
    ChronoParseError(#[from] chrono::ParseError),

    #[error("事件错误：{0}")]
    EventError(#[from] crate::event::EventError),

    #[error("文件压缩错误：{0}")]
    ZipError(#[from] async_zip::error::ZipError),

    #[error("文件监听错误：{0}")]
    NotifyError(#[from] notify::Error),

    #[error("无法去除前缀：{0}")]
    StripPrefixError(#[from] std::path::StripPrefixError),

    #[error("错误：{0}")]
    OtherError(String),

    #[cfg(feature = "tauri")]
    #[error("Tauri 错误：{0}")]
    TauriError(#[from] tauri::Error),

    #[error("无法与数据库进行交互：{0}")]
    Sqlx(#[from] sqlx::Error),

    #[error("无法进行迁移：{0}")]
    SqlxMigrate(#[from] sqlx::migrate::MigrateError),

    #[error("无法移动文件夹：{0}")]
    DirectoryMoveError(String),

    #[error("无法解析 DNS：{0}")]
    DNSError(#[from] hickory_resolver::ResolveError),

    #[error("An online profile for {user_name} is not available")]
    OnlineMinecraftProfileUnavailable { user_name: String },

    #[error("Invalid data URL: {0}")]
    InvalidDataUrl(#[from] DataUrlError),

    #[error("Invalid data URL: {0}")]
    InvalidDataUrlBase64(#[from] data_url::forgiving_base64::InvalidBase64),

    #[error("Invalid PNG")]
    InvalidPng,

    #[error("Invalid PNG: {0}")]
    PngDecodingError(#[from] png::DecodingError),

    #[error("PNG encoding error: {0}")]
    PngEncodingError(#[from] png::EncodingError),

    #[error(
        "A skin texture must have a dimension of either 64x64 or 64x32 pixels"
    )]
    InvalidSkinTexture,
}

#[derive(Debug)]
pub struct Error {
    pub raw: Arc<ErrorKind>,
    pub source: tracing_error::TracedError<Arc<ErrorKind>>,
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.source.source()
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, fmt: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(fmt, "{}", self.source)
    }
}

impl<E: Into<ErrorKind>> From<E> for Error {
    fn from(source: E) -> Self {
        let error = Into::<ErrorKind>::into(source);
        let boxed_error = Arc::new(error);

        Self {
            raw: boxed_error.clone(),
            source: boxed_error.in_current_span(),
        }
    }
}

impl ErrorKind {
    pub fn as_error(self) -> Error {
        self.into()
    }
}

pub type Result<T> = core::result::Result<T, Error>;
