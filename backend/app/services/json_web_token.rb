class JsonWebToken
  ALGORITHM = "HS256"
  EXPIRY = 24.hours

  class << self
    def encode(payload)
      JWT.encode(payload.merge(exp: EXPIRY.from_now.to_i), secret_key, ALGORITHM)
    end

    def decode(token)
      return if token.blank?

      body, = JWT.decode(token, secret_key, true, { algorithm: ALGORITHM })
      ActiveSupport::HashWithIndifferentAccess.new(body)
    rescue JWT::DecodeError
      nil
    end

    private

    def secret_key
      Rails.application.secret_key_base
    end
  end
end
