import ScreenHeader from "@/components/ui/ScreenHeader";
import { Colors, FontSize, Spacing } from "@/constants/theme";
import { PRIVACY_POLICY_VERSION } from "@/constants/legal";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.listText}>{children}</Text>
    </View>
  );
}

const updatedDisplay = new Date(PRIVACY_POLICY_VERSION).toLocaleDateString('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScreenHeader title="Политика конфиденциальности" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>{`Редакция от ${updatedDisplay}`}</Text>

        <Section title="1. Общие положения">
          <P>
            Настоящая Политика конфиденциальности (далее — «Политика»)
            определяет порядок обработки персональных данных пользователей
            мобильного приложения доставки продуктов (далее — «Приложение»).
          </P>
          <P>
            Оператор персональных данных: ИП Иванов Иван Иванович, ИНН
            123456789012.
          </P>
          <P>
            Используя Приложение, вы выражаете своё согласие с условиями
            настоящей Политики в соответствии с Федеральным законом № 152-ФЗ «О
            персональных данных».
          </P>
        </Section>

        <Section title="2. Состав персональных данных">
          <P>При использовании Приложения мы обрабатываем следующие данные:</P>
          <Li>Имя пользователя</Li>
          <Li>Номер мобильного телефона</Li>
          <Li>Адреса доставки (улица, дом, квартира, этаж, подъезд)</Li>
          <Li>История заказов</Li>
          <Li>Технические данные устройства (push-токен для уведомлений)</Li>
        </Section>

        <Section title="3. Цели обработки">
          <P>Персональные данные обрабатываются в следующих целях:</P>
          <Li>Идентификация пользователя и управление аккаунтом</Li>
          <Li>Оформление и доставка заказов</Li>
          <Li>Связь с пользователем по вопросам заказа</Li>
          <Li>Отправка push-уведомлений об изменении статуса заказа</Li>
          <Li>Улучшение качества сервиса</Li>
        </Section>

        <Section title="4. Правовое основание">
          <P>
            Обработка персональных данных осуществляется на основании согласия
            субъекта персональных данных (ст. 6, ч. 1, п. 1 Федерального закона
            № 152-ФЗ).
          </P>
          <P>
            Согласие предоставляется при первом входе в Приложение путём отметки
            соответствующего чекбокса.
          </P>
        </Section>

        <Section title="5. Хранение и передача данных">
          <P>
            Данные хранятся на защищённых серверах Supabase Inc. (США) с
            использованием шифрования TLS в соответствии с международными
            стандартами безопасности.
          </P>
          <P>
            Данные не передаются третьим лицам за исключением случаев,
            необходимых для выполнения заказа (курьерская служба). Данные
            хранятся в течение всего времени существования аккаунта
            пользователя.
          </P>
        </Section>

        <Section title="6. Права пользователя">
          <P>Вы вправе в любое время:</P>
          <Li>Получить информацию об обрабатываемых данных</Li>
          <Li>Исправить неточные данные в разделе «Профиль»</Li>
          <Li>Отозвать согласие и запросить удаление аккаунта</Li>
          <Li>Обратиться с жалобой в Роскомнадзор</Li>
        </Section>

        <Section title="7. Контакты оператора">
          <P>
            По всем вопросам, связанным с обработкой персональных данных,
            обращайтесь:
          </P>
          <P>Email: test@test.ru</P>
          <P>Срок ответа на обращения — 30 дней с момента получения запроса.</P>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  updated: {
    fontSize: FontSize.xs,
    color: Colors.light.textLight,
    marginBottom: Spacing.l,
  },
  section: {
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    fontSize: FontSize.m,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  paragraph: {
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.s,
  },
  listItem: {
    flexDirection: "row",
    gap: Spacing.s,
    marginBottom: 6,
  },
  bullet: {
    fontSize: FontSize.s,
    color: Colors.light.primary,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
});
