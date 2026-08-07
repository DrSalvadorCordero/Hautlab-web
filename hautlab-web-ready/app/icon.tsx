import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const hautlabMark =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANAAAAENCAYAAAB+c+sxAAACjUlEQVR42u3cMQ6DMAxA0bjy/a8cpi4MVQUJIdZ7F6hq9GuWOlprvT0vGmfdCLYTHzMQD9efm4DgBgGBgEBAICAQECAgEBAICAQECAgEBAICAQECAgGAAAGBgEBAICBAQCAgEBAUk4W+y+zTUG7ZYQOBgMArHC9Q7bX08QuvNhAICAQEAgIBAQICAYGAQECAgEBAICAQEAgIEBAICAQEAgIEBAICAYGAAAGBgEBAICAQECAgEBAICAQECAgEBAICAQECAgGBgEBAICBAQCAgEBAICBAQDJRG8AphBDYQCAgQEAgIBAQCAgQEAgIBgYBAQICAQEAgIBAQICAQEAgIBAQICAQEAgIBgYAAAYGAQEAgIOAXx+X/141gmDLH9G0gEBAICAQEAgIEBAICAYGAAAGBgEBAICAQECAgEBAICAQECAgEBAICAQECAgHBWpUOK4bHiQ0EAgIBAQICAYGAQECAgEBAICAQEAgIEBAICAQEAgIEBBNU+kdq9zi3UebfwzYQCAgEBAICAQECAgGBgEBAgIBAQCAgEBAICBAQCAgEBAICBAQCAgGBgICvSmetwuO8zWkwGwg/QgICAYGAAAGBgEBAICBAQCAgEBAICAQECAgEBAICAQECAgGBgEBAICBAQCAgEBAICBAQzJRGMMyKu9JO8dpAbBYtAgIBgYBAQCAgQEAgIBAQCAgQEAgIBAQCAgQEAgIBgYBAQICAQEAgIBAQICAQEAgIBAQCAgQEAgIBgYAAAYGAQEAgIEBAICAQEAgIBAQICAQEAgIBAQKCOXLR53ajxwYCAQECAgHBXtIIOAkjsIFAQCAgEBAgIBAQCAgEBAICBAQCAgGBgAABgYBAQCAgQEAgIBAQ7O0Ag1cOLrGqh1wAAAAASUVORK5CYII=";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8ded5",
        }}
      >
        <img
          src={hautlabMark}
          width="208"
          height="269"
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  );
}
